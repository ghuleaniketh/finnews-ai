from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Watchlist, Analysis
from app.schemas import AnalyzeRequest, AnalysisResponse
from app.services.pipeline import pipeline_service

router = APIRouter(tags=["analyze"])


@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
def analyze_company(payload: AnalyzeRequest, db: Session = Depends(get_db)):
    """Trigger an end-to-end financial intelligence analysis for a company."""
    try:
        analysis = pipeline_service.run_analysis(
            db=db,
            watchlist_id=payload.watchlist_id,
            max_articles=payload.max_articles,
        )
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Analysis pipeline error: {e}")


@router.get("/watchlist/{id}/analyses", response_model=list[AnalysisResponse])
def get_watchlist_analyses(id: int, db: Session = Depends(get_db)):
    """Get all past analyses for a watchlist company, ordered newest first."""
    company = db.query(Watchlist).filter(Watchlist.id == id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Watchlist item {id} not found.")

    analyses = (
        db.query(Analysis)
        .filter(Analysis.watchlist_id == id)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return analyses
