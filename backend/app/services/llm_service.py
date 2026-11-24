import json
import logging
from app.config import settings
from app.schemas import GeminiAnalysisOutput
from app.prompts import SYSTEM_PROMPT, build_analysis_prompt

logger = logging.getLogger("llm_service")


class LLMService:
    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or settings.GOOGLE_API_KEY
        self.model = model or settings.GEMINI_MODEL

    def analyze_news(
        self,
        company_name: str,
        ticker: str | None,
        articles: list[dict],
        recalled_memory: list[str],
    ) -> GeminiAnalysisOutput:
        """Call Gemini to generate structured financial intelligence from news and memory.

        Uses JSON response mode and strict Pydantic response_schema. Retries once if output fails.
        """
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY is not set. Please provide a Google API key in .env.")

        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.api_key)
        prompt_text = build_analysis_prompt(
            company_name=company_name,
            ticker=ticker,
            articles=articles,
            recalled_memory=recalled_memory,
        )

        config_kwargs = {
            "system_instruction": SYSTEM_PROMPT,
            "response_mime_type": "application/json",
            "response_schema": GeminiAnalysisOutput,
            "temperature": 0.1,
            "max_output_tokens": 4096,
        }
        if "lite" not in self.model.lower():
            config_kwargs["thinking_config"] = types.ThinkingConfig(thinking_budget=0)

        config = types.GenerateContentConfig(**config_kwargs)

        import time
        last_error = None
        delays = [2.0, 4.0, 6.0]
        for attempt in range(4):
            try:
                logger.info(f"Invoking Gemini model '{self.model}' (attempt {attempt + 1}/4)...")
                response = client.models.generate_content(
                    model=self.model,
                    contents=prompt_text,
                    config=config,
                )

                raw_text = response.text or ""
                # Parse JSON and validate against GeminiAnalysisOutput
                data = json.loads(raw_text)
                validated = GeminiAnalysisOutput.model_validate(data)
                return validated
            except Exception as e:
                logger.warning(f"Gemini call attempt {attempt + 1}/4 failed: {e}")
                last_error = e
                if attempt < 3:
                    time.sleep(delays[attempt])

        raise RuntimeError(f"Gemini analysis generation failed after 4 attempts: {last_error}")


llm_service = LLMService()
