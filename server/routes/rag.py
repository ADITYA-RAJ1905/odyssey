"""
Island 6: THE ARCHIVE (Retrieval-Augmented Generation Routes)
Ingests arbitrary user-entered URLs, constructs FAISS vector indices,
synthesizes grounded questions, and verifies answers via cosine similarity.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from server.rag_engine import rag_engine
from server.services.scoring_service import scoring_service
from server.services.player_service import player_service

router = APIRouter(prefix="/api/islands/rag", tags=["rag"])

class RAGIngestRequest(BaseModel):
    url: str

class RAGEvaluateRequest(BaseModel):
    question_id: str
    player_answer: str
    time_taken: Optional[float] = 10.0
    player_id: Optional[str] = "default"

RAG_PRESETS = [
    {
        "id": "preset_deep_blue",
        "title": "Deep Blue vs Kasparov",
        "category": "Computing History",
        "url": "https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer)",
        "desc": "The historic 1997 chess supercomputer match that marked an AI milestone."
    },
    {
        "id": "preset_ai",
        "title": "Artificial Intelligence",
        "category": "Computer Science",
        "url": "https://en.wikipedia.org/wiki/Artificial_intelligence",
        "desc": "Foundational origins, Dartmouth workshop, machine learning, and neural networks."
    },
    {
        "id": "preset_apollo",
        "title": "Apollo 11 Mission",
        "category": "Space Exploration",
        "url": "https://en.wikipedia.org/wiki/Apollo_11",
        "desc": "The first lunar landing by Neil Armstrong and Buzz Aldrin in 1969."
    },
    {
        "id": "preset_webb",
        "title": "James Webb Telescope",
        "category": "Astronomy & Optics",
        "url": "https://en.wikipedia.org/wiki/James_Webb_Space_Telescope",
        "desc": "Infrared space observatory with 18 gold-plated hexagonal mirrors."
    }
]

@router.get("/presets")
def get_rag_presets():
    return RAG_PRESETS

@router.post("/ingest")
def ingest_url(req: RAGIngestRequest):
    if not req.url or len(req.url.strip()) < 4:
        raise HTTPException(status_code=400, detail="Please enter a valid URL.")
    result = rag_engine.ingest_url_and_generate_questions(req.url)
    return result

@router.post("/evaluate")
def evaluate_rag(req: RAGEvaluateRequest):
    eval_res = rag_engine.evaluate_rag_answer(req.question_id, req.player_answer)
    is_correct = eval_res["is_correct"]

    profile = player_service.get_profile(req.player_id)
    score_res = scoring_service.calculate_classification_score(
        is_correct=is_correct,
        time_taken_seconds=req.time_taken,
        current_streak=profile["streak"],
        difficulty="medium"
    )

    updated_profile = player_service.update_score("rag", score_res["points_awarded"], score_res["new_streak"], req.player_id)
    eval_res["score_result"] = score_res
    eval_res["player_stats"] = updated_profile
    return eval_res

