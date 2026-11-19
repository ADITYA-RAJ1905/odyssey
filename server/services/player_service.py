"""
Player Persistence & State Service for Odyssey
Backs player profile, relics, scores, and unlocked islands with SQLite.
"""

import os
import sqlite3
import json
from typing import Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "odyssey.db")

RELIC_MAP = {
    1: {"id": "relic_ml", "name": "The Matrix of Foresight", "desc": "Reveals mathematical certainty amidst statistical noise."},
    2: {"id": "relic_dl", "name": "The Prismatic Mirror", "desc": "Reflects the subtle neural expressions of sentient beings."},
    3: {"id": "relic_cv", "name": "The Lens of Perception", "desc": "Separates physical silhouettes from the chaotic visual void."},
    4: {"id": "relic_nlp", "name": "The Echo Stone", "desc": "Decodes the hidden intent, sarcasm, and sentiment in stranded voices."},
    5: {"id": "relic_rl", "name": "The Compass of Optimality", "desc": "Points inexorably toward the Bellman-optimal path of survival."},
    6: {"id": "relic_rag", "name": "The Codex of Retrieval", "desc": "Indexes the boundless sea of knowledge into vector embeddings."}
}

class PlayerService:
    def __init__(self):
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS player_profile (
                id TEXT PRIMARY KEY,
                name TEXT,
                current_island INTEGER,
                conquered_islands TEXT,
                island_scores TEXT,
                total_score INTEGER,
                streak INTEGER,
                relics TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

        # Check if default player exists
        c.execute("SELECT id FROM player_profile WHERE id = 'default'")
        if not c.fetchone():
            default_state = {
                "id": "default",
                "name": "Wanderer",
                "current_island": 1,
                "conquered_islands": json.dumps([]),
                "island_scores": json.dumps({"ml": 0, "dl": 0, "cv": 0, "nlp": 0, "rl": 0, "rag": 0}),
                "total_score": 0,
                "streak": 0,
                "relics": json.dumps([])
            }
            c.execute("""
                INSERT INTO player_profile (id, name, current_island, conquered_islands, island_scores, total_score, streak, relics)
                VALUES (:id, :name, :current_island, :conquered_islands, :island_scores, :total_score, :streak, :relics)
            """, default_state)
            conn.commit()
        conn.close()

    def get_profile(self, player_id: str = "default") -> Dict[str, Any]:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM player_profile WHERE id = ?", (player_id,))
        row = c.fetchone()
        conn.close()

        if not row:
            return self.reset_profile(player_id)

        conquered = json.loads(row["conquered_islands"])
        scores = json.loads(row["island_scores"])
        if "rag" not in scores:
            scores["rag"] = 0
        relics = json.loads(row["relics"])

        # Determine rank title based on conquered count
        conq_count = len(conquered)
        if conq_count >= 6:
            rank_title = "Grandmaster of the Odyssey"
        elif conq_count == 5:
            rank_title = "Oracle of the Archives"
        elif conq_count == 4:
            rank_title = "Architect of Minds"
        elif conq_count == 3:
            rank_title = "Perceptive Explorer"
        elif conq_count == 2:
            rank_title = "Neural Seeker"
        elif conq_count == 1:
            rank_title = "Probabilistic Initiate"
        else:
            rank_title = "Stranded Castaway"

        return {
            "id": row["id"],
            "name": row["name"],
            "current_island": row["current_island"],
            "conquered_islands": conquered,
            "island_scores": scores,
            "total_score": row["total_score"],
            "streak": row["streak"],
            "relics": relics,
            "rank_title": rank_title,
            "home_unlocked": (conq_count >= 6)
        }

    def update_score(self, island_key: str, points: int, new_streak: int = None, player_id: str = "default") -> Dict[str, Any]:
        profile = self.get_profile(player_id)
        scores = profile["island_scores"]
        scores[island_key] = scores.get(island_key, 0) + points
        total_score = sum(scores.values())
        streak = new_streak if new_streak is not None else profile["streak"]

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            UPDATE player_profile
            SET island_scores = ?, total_score = ?, streak = ?
            WHERE id = ?
        """, (json.dumps(scores), total_score, streak, player_id))
        conn.commit()
        conn.close()

        return self.get_profile(player_id)

    def conquer_island(self, island_num: int, player_id: str = "default") -> Dict[str, Any]:
        profile = self.get_profile(player_id)
        conquered = profile["conquered_islands"]
        if island_num not in conquered:
            conquered.append(island_num)

        relics = profile["relics"]
        if island_num in RELIC_MAP:
            relic = RELIC_MAP[island_num]
            if not any(r["id"] == relic["id"] for r in relics):
                relics.append(relic)

        next_island = min(7, island_num + 1)

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            UPDATE player_profile
            SET conquered_islands = ?, relics = ?, current_island = ?
            WHERE id = ?
        """, (json.dumps(conquered), json.dumps(relics), next_island, player_id))
        conn.commit()
        conn.close()

        return self.get_profile(player_id)

    def reset_profile(self, player_id: str = "default") -> Dict[str, Any]:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("DELETE FROM player_profile WHERE id = ?", (player_id,))
        default_state = {
            "id": player_id,
            "name": "Wanderer",
            "current_island": 1,
            "conquered_islands": json.dumps([]),
            "island_scores": json.dumps({"ml": 0, "dl": 0, "cv": 0, "nlp": 0, "rl": 0, "rag": 0}),
            "total_score": 0,
            "streak": 0,
            "relics": json.dumps([])
        }
        c.execute("""
            INSERT INTO player_profile (id, name, current_island, conquered_islands, island_scores, total_score, streak, relics)
            VALUES (:id, :name, :current_island, :conquered_islands, :island_scores, :total_score, :streak, :relics)
        """, default_state)
        conn.commit()
        conn.close()

        return self.get_profile(player_id)

player_service = PlayerService()

