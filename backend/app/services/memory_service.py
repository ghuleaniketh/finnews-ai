import os
import logging
import re
from pathlib import Path
import numpy as np

import memento.embedder
import memento.memory_store
from memento.config import MementoConfig, EmbeddingConfig, LLMConfig
from memento import MemoryStore
from app.config import settings

logger = logging.getLogger("memory_service")


class GeminiEmbedder:
    """Gemini embedder using gemini-embedding-001 (384-dimensional, L2-normalized)."""

    def __init__(self, api_key: str | None = None, model: str = "gemini-embedding-001", dimension: int = 384):
        self._dimension = dimension
        self._model = model
        self._api_key = api_key or settings.GOOGLE_API_KEY or os.environ.get("GOOGLE_API_KEY")
        if not self._api_key:
            raise ValueError(
                "GOOGLE_API_KEY is not set. A valid Google API key is required for gemini-embedding-001 embeddings."
            )
        from google import genai
        self._client = genai.Client(api_key=self._api_key)

    @property
    def dimension(self) -> int:
        return self._dimension

    def _normalize(self, vec: np.ndarray) -> np.ndarray:
        """L2-normalize vector to unit length."""
        norm = np.linalg.norm(vec)
        if norm > 0:
            return vec / norm
        return vec

    def embed(self, text: str) -> np.ndarray:
        if not text:
            raise ValueError("Cannot embed empty text.")
        from google.genai import types
        try:
            res = self._client.models.embed_content(
                model=self._model,
                contents=text,
                config=types.EmbedContentConfig(output_dimensionality=self._dimension),
            )
        except Exception as e:
            logger.error(f"Gemini embedding API call failed for model '{self._model}': {e}", exc_info=True)
            raise RuntimeError(f"Gemini embedding call failed: {e}") from e

        if not res.embeddings or not res.embeddings[0].values:
            raise RuntimeError(f"Gemini embedding returned empty vector for text: '{text[:50]}...'")

        vec = np.array(res.embeddings[0].values, dtype=np.float32)
        if len(vec) != self._dimension:
            raise RuntimeError(f"Expected embedding dimension {self._dimension}, got {len(vec)}")
        return self._normalize(vec)

    def embed_batch(self, texts: list[str]) -> list[np.ndarray]:
        if not texts:
            return []
        from google.genai import types
        try:
            res = self._client.models.embed_content(
                model=self._model,
                contents=texts,
                config=types.EmbedContentConfig(output_dimensionality=self._dimension),
            )
        except Exception as e:
            logger.error(f"Gemini batch embedding API call failed for model '{self._model}': {e}", exc_info=True)
            raise RuntimeError(f"Gemini batch embedding call failed: {e}") from e

        if not res.embeddings or len(res.embeddings) != len(texts):
            count = len(res.embeddings) if res.embeddings else 0
            raise RuntimeError(f"Gemini batch embedding count mismatch: got {count} vectors for {len(texts)} texts.")

        results = []
        for i, emb in enumerate(res.embeddings):
            if not emb.values:
                raise RuntimeError(f"Empty embedding vector returned at index {i}")
            vec = np.array(emb.values, dtype=np.float32)
            if len(vec) != self._dimension:
                raise RuntimeError(f"Expected embedding dimension {self._dimension}, got {len(vec)}")
            results.append(self._normalize(vec))
        return results


# Register our lightweight Gemini embedder into Memento
_orig_create_embedder = memento.embedder.create_embedder


def custom_create_embedder(config: EmbeddingConfig):
    if config.provider == "gemini":
        return GeminiEmbedder(model="gemini-embedding-001", dimension=config.dimension)
    elif config.provider == "openai":
        return _orig_create_embedder(config)
    elif config.provider == "sentence-transformers":
        try:
            return _orig_create_embedder(config)
        except ImportError:
            return GeminiEmbedder(model="gemini-embedding-001", dimension=config.dimension)
    return GeminiEmbedder(model="gemini-embedding-001", dimension=config.dimension)


memento.embedder.create_embedder = custom_create_embedder
memento.memory_store.create_embedder = custom_create_embedder


# Patch Memento's GeminiLLMClient to use sufficient tokens and zero thinking budget for JSON extraction
import memento.llm
from google.genai import types

_orig_gemini_complete = memento.llm.GeminiLLMClient.complete


def custom_gemini_complete(self, messages: list[dict], model: str, system: str | None = None, temperature: float = 0.0, max_tokens: int = 1024) -> str:
    try:
        from google import genai
        client = genai.Client(api_key=self._api_key or os.environ.get("GOOGLE_API_KEY", ""))

        contents = []
        if system:
            contents.append({"role": "user", "parts": [{"text": f"System: {system}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood."}]})
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        effective_model = model or settings.GEMINI_MODEL
        cfg_kwargs = {
            "temperature": temperature,
            "max_output_tokens": max(max_tokens, 4096),
        }
        if "lite" not in effective_model.lower():
            cfg_kwargs["thinking_config"] = types.ThinkingConfig(thinking_budget=0)

        response = client.models.generate_content(
            model=effective_model,
            contents=contents,
            config=types.GenerateContentConfig(**cfg_kwargs),
        )
        return response.text or ""
    except Exception as e:
        logger.error(f"Memento GeminiLLMClient.complete error: {e}", exc_info=True)
        raise


memento.llm.GeminiLLMClient.complete = custom_gemini_complete


def matches_company(text: str, company_name: str, ticker: str | None = None) -> bool:
    """Check if a memory item explicitly refers to the target company or its ticker."""
    text_lower = text.lower()
    c_name_lower = company_name.lower().strip()
    if c_name_lower in text_lower:
        return True
    if ticker and ticker.lower().strip() in text_lower:
        return True

    # Check significant distinctive words in company name (skipping generic corporate words)
    stop_words = {
        "bank", "ltd", "limited", "corp", "corporation", "inc", "incorporated",
        "group", "holdings", "co", "the", "and", "company", "india", "motors",
        "finance", "financial", "services", "industries", "enterprises"
    }
    words = [w for w in c_name_lower.split() if len(w) >= 3 and w not in stop_words]
    for w in words:
        if w in text_lower:
            return True
    return False


def clean_recalled_items(
    raw_items: list[str],
    company_name: str,
    ticker: str | None = None,
    max_items: int = 8,
) -> list[str]:
    """Clean, post-filter by company/ticker, deduplicate, and cap memory items.

    - Drops structural lines ("Related Conversations", "Conversation (recorded: ...)", headers)
    - Replaces internal newlines so each item is a clean single line
    - Strictly keeps only items matching the target company or ticker
    - Removes company/ticker headers, incomplete labels, and duplicate text
    - Truncates each item to 200 characters
    - Caps output at max_items (default 8)
    """
    structural_keywords = {
        "related conversations",
        "conversation",
        "conversation (recorded:",
        "related facts",
        "entities:",
        "properties:",
        "no relevant memories found.",
    }
    cleaned = []
    seen = set()

    for item in raw_items:
        # Collapse internal newlines and multiple spaces into a single line
        line = " ".join(item.split()).strip()
        # Strip markdown headers and bullets
        line = line.lstrip("#-*\u2022 ").strip()
        line = re.sub(r"^\[Company:\s*[^\]|]+(?:\s*\|\s*Ticker:\s*[^\]]+)?\]\s*", "", line, flags=re.IGNORECASE)
        if not line or len(line) < 8:
            continue

        # Memento frequently emits labels such as "Key Events:" separately
        # from their value.  They do not provide usable recall context.
        if line.endswith(":"):
            continue

        line_lower = line.lower()
        if any(line_lower.startswith(k) or line_lower == k for k in structural_keywords):
            continue

        # Post-filter: must mention company or ticker
        if not matches_company(line, company_name, ticker):
            continue

        line = line[:200].rstrip()
        norm = line.lower()
        if norm in seen:
            continue
        seen.add(norm)
        cleaned.append(line)

        if len(cleaned) >= max_items:
            break

    return cleaned


class MemoryService:
    def __init__(self):
        db_path = Path(settings.MEMENTO_DB_PATH).resolve()
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.db_path = db_path

        self.config = MementoConfig(
            db_path=self.db_path,
            embedding=EmbeddingConfig(provider="gemini", dimension=384),
            llm=LLMConfig(
                provider="gemini",
                api_key=settings.GOOGLE_API_KEY,
                extraction_model=settings.GEMINI_MODEL,
                tiebreaker_model=settings.GEMINI_MODEL,
            ),
        )

    def get_store(self) -> MemoryStore:
        """Create and return a MemoryStore instance."""
        return MemoryStore(self.config)

    def ingest_text(
        self,
        text: str,
        conversation_id: str = "",
        source_type: str = "note",
        authority: float = 0.9,
    ):
        """Ingest text into the Memento knowledge graph."""
        if not text.strip():
            return None
        try:
            with self.get_store() as store:
                logger.info(f"Ingesting into Memento (source_type={source_type}): '{text[:80]}...'")
                result = store.ingest(
                    text=text,
                    conversation_id=conversation_id,
                    source_type=source_type,
                    authority=authority,
                )
                return result
        except Exception as e:
            logger.error(f"Memento ingestion failed: {e}", exc_info=True)
            return None

    def ingest_company_text(
        self,
        company_name: str,
        ticker: str | None,
        text: str,
        conversation_id: str = "",
        source_type: str = "note",
        authority: float = 0.9,
    ):
        """Ingest text with explicit company name and ticker scoping."""
        ticker_str = f" (Ticker: {ticker})" if ticker else ""
        header = f"[Company: {company_name}{ticker_str}]"
        payload = text if header.lower() in text.lower() else f"{header} {text}"
        return self.ingest_text(
            text=payload,
            conversation_id=conversation_id,
            source_type=source_type,
            authority=authority,
        )

    def recall(self, query: str, token_budget: int = 2000) -> list[str]:
        """Recall historical context about a company or topic.

        Returns a raw list of memory strings from structured facts and verbatim text.
        """
        try:
            with self.get_store() as store:
                ctx = store.recall(query=query, token_budget=token_budget)
                items = []

                # Add structured facts if available
                if getattr(ctx, "facts", None):
                    for fact in ctx.facts:
                        entity_name = getattr(fact.entity, "name", "")
                        prop_key = getattr(fact, "key", "")
                        prop_val = getattr(fact, "value", "")
                        target = getattr(fact, "target_entity", None)
                        target_name = getattr(target, "name", "") if target else ""
                        fact_type = getattr(fact, "fact_type", "")

                        if fact_type == "relationship" and target_name:
                            items.append(f"{entity_name} relates to {target_name}")
                        elif prop_key and prop_val:
                            items.append(f"{entity_name}: {prop_key} = {prop_val}")

                # If no structured facts or in addition, inspect verbatim text
                raw_text = getattr(ctx, "text", "") or ""
                if raw_text and raw_text != "No relevant memories found.":
                    lines = [line.strip().lstrip("#-*\u2022 ") for line in raw_text.splitlines() if line.strip()]
                    for line in lines:
                        if len(line) > 10 and not line.startswith("Conversation (") and line not in items:
                            items.append(line)

                return items
        except Exception as e:
            logger.error(f"Memento recall failed: {e}", exc_info=True)
            return []

    def get_items_for_company(self, company_name: str, ticker: str | None = None) -> list[str]:
        """Retrieve recalled memory items strictly scoped to a company and capped at 8 items."""
        query = f"{company_name} {ticker or ''} financial news facts notes events".strip()
        raw_items = self.recall(query=query)
        cleaned_items = clean_recalled_items(
            raw_items=raw_items,
            company_name=company_name,
            ticker=ticker,
            max_items=8,
        )
        return cleaned_items


memory_service = MemoryService()
