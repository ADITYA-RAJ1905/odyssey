"""
Island 3: THE OBSERVER (Computer Vision Routes)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from server.services.challenge_service import challenge_service
from server.services.difficulty_service import difficulty_service
from server.services.scoring_service import scoring_service
from server.services.player_service import player_service
from server.models.cv.detector import cv_detector
from server.data.datasets.cv_dataset import CV_SCENES

router = APIRouter(prefix="/api/islands/cv", tags=["cv"])

class CVEvaluateRequest(BaseModel):
    challenge_id: str
    player_answer: Any
    time_taken: Optional[float] = 10.0
    player_id: Optional[str] = "default"

@router.get("/challenge")
def get_cv_challenge():
    diff = difficulty_service.get_difficulty("cv")
    return challenge_service.get_cv_challenge(difficulty=diff)

@router.post("/evaluate")
def evaluate_cv(req: CVEvaluateRequest):
    scene = next((s for s in CV_SCENES if s["id"] == req.challenge_id), None)
    if not scene:
        raise HTTPException(status_code=404, detail="Scene challenge not found")

    eval_result = cv_detector.evaluate_scene_question(scene, str(req.player_answer))
    is_correct = eval_result["is_correct"]

    profile = player_service.get_profile(req.player_id)
    score_res = scoring_service.calculate_classification_score(
        is_correct=is_correct,
        time_taken_seconds=req.time_taken,
        current_streak=profile["streak"],
        difficulty=scene["difficulty"]
    )
    difficulty_service.record_result("cv", is_correct)
    updated_profile = player_service.update_score("cv", score_res["points_awarded"], score_res["new_streak"], req.player_id)

    eval_result["score_result"] = score_res
    eval_result["player_stats"] = updated_profile
    return eval_result

