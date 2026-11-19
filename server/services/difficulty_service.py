"""
Dynamic Difficulty Adaptation Service for Odyssey
Tracks rolling performance per island and adjusts challenge difficulty dynamically.
"""

from typing import Dict, Any, List

class DifficultyService:
    def __init__(self):
        # Maps island_id -> list of booleans (recent results)
        self.history: Dict[str, List[bool]] = {}

    def record_result(self, island: str, is_correct: bool):
        if island not in self.history:
            self.history[island] = []
        self.history[island].append(is_correct)
        if len(self.history[island]) > 6:
            self.history[island].pop(0)

    def get_difficulty(self, island: str) -> str:
        results = self.history.get(island, [])
        if len(results) < 2:
            return "medium" # default starting tier
        accuracy = sum(1 for r in results if r) / len(results)
        if accuracy >= 0.8:
            return "hard"
        elif accuracy <= 0.45:
            return "easy"
        else:
            return "medium"

    def reset_island(self, island: str):
        if island in self.history:
            self.history[island] = []

difficulty_service = DifficultyService()

