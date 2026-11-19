"""
Island 4: THE VOICES (NLP Routes)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from server.services.challenge_service import challenge_service
from server.services.difficulty_service import difficulty_service
from server.services.scoring_service import scoring_service
from server.services.player_service import player_service
from server.models.nlp.language_model import language_model
from server.data.datasets.nlp_dataset import NLP_CHALLENGES

router = APIRouter(prefix="/api/islands/nlp", tags=["nlp"])

class NLPEvaluateRequest(BaseModel):
    challenge_id: str
    player_choice: str
    time_taken: Optional[float] = 8.0
    player_id: Optional[str] = "default"

@router.get("/challenge")
def get_nlp_challenge(category: Optional[str] = None):
    diff = difficulty_service.get_difficulty("nlp")
    return challenge_service.get_nlp_challenge(category=category, difficulty=diff)

@router.post("/evaluate")
def evaluate_nlp(req: NLPEvaluateRequest):
    sample = next((s for s in NLP_CHALLENGES if s["id"] == req.challenge_id), None)
    if not sample:
        raise HTTPException(status_code=404, detail="NLP challenge sample not found")

    eval_result = language_model.evaluate_text_challenge(sample, req.player_choice)
    is_correct = eval_result["is_correct"]

    profile = player_service.get_profile(req.player_id)
    score_res = scoring_service.calculate_classification_score(
        is_correct=is_correct,
        time_taken_seconds=req.time_taken,
        current_streak=profile["streak"],
        difficulty=sample["difficulty"]
    )
    difficulty_service.record_result("nlp", is_correct)
    updated_profile = player_service.update_score("nlp", score_res["points_awarded"], score_res["new_streak"], req.player_id)

    eval_result["score_result"] = score_res
    eval_result["player_stats"] = updated_profile
    return eval_result

