"""
Island 2: THE MIRROR (Deep Learning Routes)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from server.services.challenge_service import challenge_service
from server.services.difficulty_service import difficulty_service
from server.services.scoring_service import scoring_service
from server.services.player_service import player_service
from server.models.dl.emotion_model import emotion_model
from server.data.datasets.dl_dataset import DL_EMOTION_SAMPLES

router = APIRouter(prefix="/api/islands/dl", tags=["dl"])

class DLEvaluateRequest(BaseModel):
    challenge_id: str
    player_emotion: str
    time_taken: Optional[float] = 6.0
    player_id: Optional[str] = "default"

@router.get("/challenge")
def get_dl_challenge():
    diff = difficulty_service.get_difficulty("dl")
    return challenge_service.get_dl_challenge(difficulty=diff)

@router.post("/evaluate")
def evaluate_dl(req: DLEvaluateRequest):
    sample = next((s for s in DL_EMOTION_SAMPLES if s["id"] == req.challenge_id), None)
    if not sample:
        raise HTTPException(status_code=404, detail="Facial emotion challenge not found")

    # Run AI inference
    ai_res = emotion_model.analyze_emotion(sample)
    correct_emotion = sample["actual_emotion"].upper()
    player_ans = req.player_emotion.upper()

    is_correct = (player_ans == correct_emotion)

    profile = player_service.get_profile(req.player_id)
    score_res = scoring_service.calculate_classification_score(
        is_correct=is_correct,
        time_taken_seconds=req.time_taken,
        current_streak=profile["streak"],
        difficulty=sample["difficulty"]
    )
    difficulty_service.record_result("dl", is_correct)
    updated_profile = player_service.update_score("dl", score_res["points_awarded"], score_res["new_streak"], req.player_id)

    return {
        "is_correct": is_correct,
        "player_emotion": player_ans,
        "correct_emotion": correct_emotion,
        "ai_prediction": ai_res["emotion"],
        "ai_confidence": ai_res["confidence"],
        "probabilities": ai_res["probabilities"],
        "model_type": ai_res["model_type"],
        "score_result": score_res,
        "player_stats": updated_profile,
        "visual_cues": sample.get("facial_cues", []),
        "explanation": f"The expression is characterized by: {', '.join(sample.get('facial_cues', []))}."
    }

