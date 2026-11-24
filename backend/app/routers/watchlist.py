from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Watchlist
from app.schemas import WatchlistCreate, WatchlistResponse

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("", response_model=list[WatchlistResponse])
def get_watchlist(db: Session = Depends(get_db)):
    """Retrieve all tracked companies in the watchlist."""
    items = db.query(Watchlist).order_by(Watchlist.created_at.asc()).all()
    return items


@router.post("", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
def create_watchlist_item(payload: WatchlistCreate, db: Session = Depends(get_db)):
    """Add a new company to the watchlist."""
    name_clean = payload.name.strip()
    if not name_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company name cannot be empty.",
        )

    ticker_clean = payload.ticker.strip().upper() if payload.ticker else None
    item = Watchlist(name=name_clean, ticker=ticker_clean)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_watchlist_item(id: int, db: Session = Depends(get_db)):
    """Delete a company from the watchlist."""
    item = db.query(Watchlist).filter(Watchlist.id == id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Watchlist item {id} not found.",
        )

    db.delete(item)
    db.commit()
    return {"message": "Watchlist item deleted successfully."}
