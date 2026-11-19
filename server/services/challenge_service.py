"""
Challenge Management & Randomization Service for Odyssey
Pulls challenges across datasets with difficulty filtering and recent-history avoidance.
"""

import random
from typing import Dict, Any, List
from server.data.datasets.ml_dataset import ML_LOAN_SAMPLES, ML_HOUSE_SAMPLES, ML_ANOMALY_SAMPLES
from server.data.datasets.dl_dataset import DL_EMOTION_SAMPLES
from server.data.datasets.cv_dataset import CV_SCENES
from server.data.datasets.nlp_dataset import NLP_CHALLENGES

class ChallengeService:
    def __init__(self):
        # Track last 3 served IDs per island to ensure variety
        self.served_ids: Dict[str, List[str]] = {
            "ml": [],
            "dl": [],
            "cv": [],
            "nlp": []
        }

    def _sample_avoiding_recent(self, pool: List[Dict[str, Any]], island_key: str) -> Dict[str, Any]:
        recent = self.served_ids.get(island_key, [])
        candidates = [item for item in pool if item["id"] not in recent]
        if not candidates:
            candidates = pool

        chosen = random.choice(candidates)
        recent.append(chosen["id"])
        if len(recent) > 3:
            recent.pop(0)
        self.served_ids[island_key] = recent
        return chosen

    def get_ml_challenge(self, challenge_type: str = None, difficulty: str = "medium") -> Dict[str, Any]:
        """Fetch random ML challenge across loan, house, or anomaly."""
        if not challenge_type:
            challenge_type = random.choice(["loan", "house", "anomaly"])

        if challenge_type == "loan":
            pool = [s for s in ML_LOAN_SAMPLES if s.get("difficulty") == difficulty] or ML_LOAN_SAMPLES
            sample = self._sample_avoiding_recent(pool, "ml")
            return {
                "challenge_type": "loan",
                "sub_title": "Credit Repayment Probability",
                "data": sample
            }
        elif challenge_type == "house":
            pool = [s for s in ML_HOUSE_SAMPLES if s.get("difficulty") == difficulty] or ML_HOUSE_SAMPLES
            sample = self._sample_avoiding_recent(pool, "ml")
            return {
                "challenge_type": "house",
                "sub_title": "Coastal Valuation Regression",
                "data": sample
            }
        else: # anomaly
            pool = [s for s in ML_ANOMALY_SAMPLES if s.get("difficulty") == difficulty] or ML_ANOMALY_SAMPLES
            sample = self._sample_avoiding_recent(pool, "ml")
            return {
                "challenge_type": "anomaly",
                "sub_title": "Telemetry Anomaly Isolation",
                "data": sample
            }

    def get_dl_challenge(self, difficulty: str = "medium") -> Dict[str, Any]:
        """Fetch random emotion facial perception challenge."""
        pool = [s for s in DL_EMOTION_SAMPLES if s.get("difficulty") == difficulty] or DL_EMOTION_SAMPLES
        sample = self._sample_avoiding_recent(pool, "dl")
        # Do not expose actual_emotion directly in challenge payload to prevent client-side inspection
        payload = {k: v for k, v in sample.items() if k != "actual_emotion"}
        payload["challenge_id"] = sample["id"]
        return payload

    def get_cv_challenge(self, difficulty: str = "medium") -> Dict[str, Any]:
        """Fetch random computer vision aerial reconnaissance scene."""
        pool = [s for s in CV_SCENES if s.get("difficulty") == difficulty] or CV_SCENES
        sample = self._sample_avoiding_recent(pool, "cv")
        payload = {
            "id": sample["id"],
            "difficulty": sample["difficulty"],
            "title": sample["title"],
            "description": sample["description"],
            "scene_type": sample["scene_type"],
            "svg_elements": sample["svg_elements"],
            "question": sample["question"],
            "question_type": sample["question_type"],
            "options": sample.get("options", []),
            "total_objects": len(sample["objects"])
        }
        return payload

    def get_nlp_challenge(self, category: str = None, difficulty: str = "medium") -> Dict[str, Any]:
        """Fetch random survivor text / bottle message."""
        pool = [s for s in NLP_CHALLENGES if s.get("difficulty") == difficulty] or NLP_CHALLENGES
        if category:
            cat_pool = [s for s in pool if s.get("category") == category]
            if cat_pool:
                pool = cat_pool

        sample = self._sample_avoiding_recent(pool, "nlp")
        payload = {
            "id": sample["id"],
            "category": sample["category"],
            "difficulty": sample["difficulty"],
            "title": sample["title"],
            "text": sample["text"],
            "options": sample["options"]
        }
        return payload

challenge_service = ChallengeService()

