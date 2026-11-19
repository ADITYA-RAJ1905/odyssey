"""
Scoring & Mastery Engine for Odyssey
Computes points, streak multipliers, time bonuses, and regression accuracy.
"""

from typing import Dict, Any

class ScoringService:
    @staticmethod
    def calculate_classification_score(
        is_correct: bool,
        time_taken_seconds: float = 10.0,
        current_streak: int = 0,
        difficulty: str = "medium"
    ) -> Dict[str, Any]:
        """Score a discrete choice challenge (ML, DL, CV, NLP)."""
        if not is_correct:
            return {
                "points_awarded": 0,
                "base_points": 0,
                "time_bonus": 0,
                "streak_multiplier": 1.0,
                "new_streak": 0
            }

        diff_multipliers = {"easy": 1.0, "medium": 1.4, "hard": 2.0}
        base = int(150 * diff_multipliers.get(difficulty, 1.0))

        # Time bonus: faster answer = up to 75 bonus points
        time_bonus = max(0, int(75 * (1.0 - min(time_taken_seconds, 30.0) / 30.0)))

        # Streak multiplier: +15% per consecutive correct, cap at 2.0x
        new_streak = current_streak + 1
        streak_multiplier = min(2.0, 1.0 + (new_streak - 1) * 0.15)

        total_points = int((base + time_bonus) * streak_multiplier)

        return {
            "points_awarded": total_points,
            "base_points": base,
            "time_bonus": time_bonus,
            "streak_multiplier": round(streak_multiplier, 2),
            "new_streak": new_streak
        }

    @staticmethod
    def calculate_regression_score(
        predicted: float,
        actual: float,
        time_taken_seconds: float = 10.0,
        difficulty: str = "medium"
    ) -> Dict[str, Any]:
        """Score continuous value prediction based on relative percentage error."""
        if actual == 0:
            error_pct = 0.0
        else:
            error_pct = abs(predicted - actual) / actual

        # Accuracy percentage: 100% when exact, dropping toward 0%
        accuracy_pct = max(0.0, min(100.0, (1.0 - error_pct) * 100.0))

        diff_multipliers = {"easy": 1.0, "medium": 1.4, "hard": 2.0}
        max_base = 250 * diff_multipliers.get(difficulty, 1.0)
        base_points = int(max_base * (accuracy_pct / 100.0))

        time_bonus = max(0, int(50 * (1.0 - min(time_taken_seconds, 30.0) / 30.0))) if accuracy_pct >= 70 else 0
        total_points = base_points + time_bonus

        return {
            "points_awarded": total_points,
            "base_points": base_points,
            "time_bonus": time_bonus,
            "accuracy_pct": round(accuracy_pct, 1),
            "error_pct": round(error_pct * 100, 1),
            "is_close": accuracy_pct >= 85.0
        }

    @staticmethod
    def calculate_rl_score(
        survived: bool,
        turns_used: int,
        max_turns: int,
        final_health: int,
        policy_alignment_pct: float,
        difficulty: str = "medium"
    ) -> Dict[str, Any]:
        """Score Island 5 survival outcome."""
        if not survived:
            # Consolation points based on policy alignment
            points = int(policy_alignment_pct * 3)
            return {
                "points_awarded": points,
                "survived": False,
                "policy_alignment_pct": policy_alignment_pct,
                "rank": "Perished in the Wilds"
            }

        diff_multipliers = {"easy": 1.0, "medium": 1.5, "hard": 2.2}
        diff_mult = diff_multipliers.get(difficulty, 1.0)

        base = 500 * diff_mult
        health_bonus = final_health * 2.5
        turn_efficiency_bonus = max(0, (max_turns - turns_used) * 20)
        policy_bonus = policy_alignment_pct * 3.5

        total = int(base + health_bonus + turn_efficiency_bonus + policy_bonus)

        return {
            "points_awarded": total,
            "survived": True,
            "policy_alignment_pct": policy_alignment_pct,
            "health_bonus": int(health_bonus),
            "turn_efficiency_bonus": int(turn_efficiency_bonus),
            "rank": "Optimal Survivor" if policy_alignment_pct >= 80 else "Resourceful Castaway"
        }

scoring_service = ScoringService()

