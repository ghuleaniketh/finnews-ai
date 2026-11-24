from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Analysis
from app.schemas import AnalysisResponse

router = APIRouter(prefix="/analyses", tags=["history"])


@router.get("/{id}", response_model=AnalysisResponse)
def get_analysis_by_id(id: int, db: Session = Depends(get_db)):
    """Retrieve a single analysis report by its ID."""
    analysis = db.query(Analysis).filter(Analysis.id == id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis report {id} not found.",
        )
    return analysis
