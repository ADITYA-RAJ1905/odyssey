"""
Island 5: THE DECISION (Reinforcement Learning Routes)
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from server.models.rl.survival_agent import rl_agent
from server.services.scoring_service import scoring_service
from server.services.player_service import player_service
from server.services.difficulty_service import difficulty_service

router = APIRouter(prefix="/api/islands/rl", tags=["rl"])

class RLInitRequest(BaseModel):
    difficulty: Optional[str] = None
    player_id: Optional[str] = "default"

class RLStepRequest(BaseModel):
    state: Dict[str, Any]
    action: str
    player_id: Optional[str] = "default"

class RLEvaluateRequest(BaseModel):
    final_state: Dict[str, Any]
    player_id: Optional[str] = "default"

@router.post("/init")
def init_rl_game(req: RLInitRequest):
    diff = req.difficulty or difficulty_service.get_difficulty("rl")
    session = rl_agent.create_game_session(difficulty=diff)
    return session

@router.post("/step")
def step_rl_game(req: RLStepRequest):
    res = rl_agent.step(req.state, req.action)
    return res

@router.post("/evaluate")
def evaluate_rl_game(req: RLEvaluateRequest):
    st = req.final_state
    survived = (st.get("status") == "WON")
    turns_used = st.get("turn", 0)
    max_turns = st.get("max_turns", 18)
    final_health = st.get("health", 0)
    total_decisions = max(1, st.get("total_decisions", 1))
    policy_matches = st.get("policy_matches", 0)
    policy_alignment_pct = round((policy_matches / total_decisions) * 100, 1)

    score_res = scoring_service.calculate_rl_score(
        survived=survived,
        turns_used=turns_used,
        max_turns=max_turns,
        final_health=final_health,
        policy_alignment_pct=policy_alignment_pct,
        difficulty=st.get("difficulty", "medium")
    )

    difficulty_service.record_result("rl", survived)
    profile = player_service.update_score("rl", score_res["points_awarded"], None, req.player_id)

    return {
        "score_result": score_res,
        "player_stats": profile,
        "survived": survived,
        "policy_alignment_pct": policy_alignment_pct,
        "summary": "You calculated the Bellman optimality and navigated safely." if survived else "Environmental hazards and hunger overcame the survivor."
    }

