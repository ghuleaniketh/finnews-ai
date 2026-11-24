from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Watchlist, AnalystNote
from app.schemas import NoteCreate, NoteResponse, MemoryResponse
from app.services.memory_service import memory_service
from app.services.memory_ingestion import company_memory_coordinator

router = APIRouter(tags=["notes"])


@router.get("/watchlist/{id}/notes", response_model=list[NoteResponse])
def get_analyst_notes(id: int, db: Session = Depends(get_db)):
    """Retrieve all analyst notes for a tracked company."""
    company = db.query(Watchlist).filter(Watchlist.id == id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Watchlist item {id} not found.",
        )

    notes = (
        db.query(AnalystNote)
        .filter(AnalystNote.watchlist_id == id)
        .order_by(AnalystNote.created_at.desc())
        .all()
    )
    return notes


@router.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_analyst_note(payload: NoteCreate, db: Session = Depends(get_db)):
    """Create a new analyst note: save in the application database AND ingest into Memento."""
    company = db.query(Watchlist).filter(Watchlist.id == payload.watchlist_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Watchlist item {payload.watchlist_id} not found.",
        )

    note_text = payload.note.strip()
    if not note_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note cannot be empty.",
        )

    # 1. Save in the application database
    note_record = AnalystNote(watchlist_id=company.id, note=note_text)
    db.add(note_record)
    db.commit()
    db.refresh(note_record)

    # 2. Ingest into Memento Knowledge Graph (scoped with company name and ticker)
    company_memory_coordinator.run_after_pending_ingest(
        company.id,
        lambda: memory_service.ingest_company_text(
            company_name=company.name,
            ticker=company.ticker,
            text=f"Analyst note: {note_text}",
            conversation_id=f"note_{note_record.id}",
            source_type="analyst_note",
            authority=0.98,
        ),
    )

    return note_record


@router.get("/watchlist/{id}/memory", response_model=MemoryResponse)
def get_company_memory(id: int, db: Session = Depends(get_db)):
    """Retrieve all recalled bitemporal knowledge graph items for a company."""
    company = db.query(Watchlist).filter(Watchlist.id == id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Watchlist item {id} not found.",
        )

    items = memory_service.get_items_for_company(
        company_name=company.name,
        ticker=company.ticker,
    )
    return {"items": items}
