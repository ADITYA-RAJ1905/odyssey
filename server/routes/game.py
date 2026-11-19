"""
Game Management & Player State Routes
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from server.services.player_service import player_service

router = APIRouter(prefix="/api/game", tags=["game"])

class ConquerRequest(BaseModel):
    island_num: int
    player_id: Optional[str] = "default"

class ResetRequest(BaseModel):
    player_id: Optional[str] = "default"

@router.get("/profile")
def get_player_profile(player_id: str = "default"):
    return player_service.get_profile(player_id)

@router.post("/conquer")
def conquer_island(req: ConquerRequest):
    return player_service.conquer_island(req.island_num, req.player_id)

@router.post("/reset")
def reset_game(req: ResetRequest):
    return player_service.reset_profile(req.player_id)

