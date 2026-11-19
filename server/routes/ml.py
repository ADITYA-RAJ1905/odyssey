"""
Island 1: THE PREDICTOR (Machine Learning Routes)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from server.services.challenge_service import challenge_service
from server.services.difficulty_service import difficulty_service
from server.services.scoring_service import scoring_service
from server.services.player_service import player_service
from server.models.ml.predictor import ml_predictor
from server.data.datasets.ml_dataset import ML_LOAN_SAMPLES, ML_HOUSE_SAMPLES, ML_ANOMALY_SAMPLES

router = APIRouter(prefix="/api/islands/ml", tags=["ml"])

class MLEvaluateRequest(BaseModel):
    challenge_type: str # "loan", "house", "anomaly"
    challenge_id: str
    player_prediction: Any
    time_taken: Optional[float] = 8.0
    player_id: Optional[str] = "default"

@router.get("/challenge")
def get_ml_challenge(type: Optional[str] = None):
    diff = difficulty_service.get_difficulty("ml")
    return challenge_service.get_ml_challenge(challenge_type=type, difficulty=diff)

@router.post("/evaluate")
def evaluate_ml(req: MLEvaluateRequest):
    c_type = req.challenge_type.lower()
    profile = player_service.get_profile(req.player_id)
    curr_streak = profile["streak"]

    if c_type == "loan":
        sample = next((s for s in ML_LOAN_SAMPLES if s["id"] == req.challenge_id), None)
        if not sample:
            raise HTTPException(status_code=404, detail="Challenge sample not found")

        ai_res = ml_predictor.predict_loan_repayment(sample["features"])
        correct_answer = sample["actual_repaid"] # "YES" or "NO"
        is_correct = (str(req.player_prediction).upper() == correct_answer)

        score_res = scoring_service.calculate_classification_score(
            is_correct=is_correct,
            time_taken_seconds=req.time_taken,
            current_streak=curr_streak,
            difficulty=sample["difficulty"]
        )
        difficulty_service.record_result("ml", is_correct)
        updated_profile = player_service.update_score("ml", score_res["points_awarded"], score_res["new_streak"], req.player_id)

        return {
            "is_correct": is_correct,
            "player_prediction": req.player_prediction,
            "correct_answer": correct_answer,
            "ai_result": ai_res,
            "score_result": score_res,
            "player_stats": updated_profile,
            "explanation": sample.get("explanation", f"Applicant evaluated with {correct_answer} default risk.")
        }

    elif c_type == "house":
        sample = next((s for s in ML_HOUSE_SAMPLES if s["id"] == req.challenge_id), None)
        if not sample:
            raise HTTPException(status_code=404, detail="Challenge sample not found")

        ai_res = ml_predictor.predict_house_price(sample["features"])
        actual_price = sample["actual_price"]
        try:
            player_val = float(req.player_prediction)
        except Exception:
            player_val = 0.0

        score_res = scoring_service.calculate_regression_score(
            predicted=player_val,
            actual=actual_price,
            time_taken_seconds=req.time_taken,
            difficulty=sample["difficulty"]
        )
        difficulty_service.record_result("ml", score_res["is_close"])
        updated_profile = player_service.update_score("ml", score_res["points_awarded"], None, req.player_id)

        return {
            "player_prediction": player_val,
            "actual_price": actual_price,
            "ai_predicted_price": ai_res["predicted_price"],
            "confidence_interval": ai_res["confidence_range"],
            "score_result": score_res,
            "player_stats": updated_profile,
            "explanation": f"Property valued at ${actual_price:,}. AI Gradient Boosting estimated ${ai_res['predicted_price']:,}."
        }

    elif c_type == "anomaly":
        sample = next((s for s in ML_ANOMALY_SAMPLES if s["id"] == req.challenge_id), None)
        if not sample:
            raise HTTPException(status_code=404, detail="Challenge sample not found")

        tx_matrix = [tx["features"] for tx in sample["transactions"]]
        ai_res = ml_predictor.detect_anomalies(tx_matrix)
        correct_idx = sample["correct_anomaly_index"]

        try:
            player_idx = int(req.player_prediction)
        except Exception:
            player_idx = -1

        is_correct = (player_idx == correct_idx)
        score_res = scoring_service.calculate_classification_score(
            is_correct=is_correct,
            time_taken_seconds=req.time_taken,
            current_streak=curr_streak,
            difficulty=sample["difficulty"]
        )
        difficulty_service.record_result("ml", is_correct)
        updated_profile = player_service.update_score("ml", score_res["points_awarded"], score_res["new_streak"], req.player_id)

        return {
            "is_correct": is_correct,
            "player_choice": player_idx,
            "correct_anomaly_index": correct_idx,
            "ai_suspect_index": ai_res["most_suspicious_index"],
            "anomaly_scores": ai_res["anomaly_scores"],
            "score_result": score_res,
            "player_stats": updated_profile,
            "explanation": sample.get("explanation", f"Transaction #{correct_idx + 1} demonstrated extreme isolation score deviations.")
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid challenge type")
