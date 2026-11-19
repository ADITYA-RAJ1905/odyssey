import numpy as np
from typing import Dict, Any, List

CANDIDATE_TRIALS = [
    {
        "id": "trial_heuristic_search",
        "name": "State-Space Labyrinth: Multi-Goal A*",
        "primary_dimension": "SEARCH",
        "target_island": "island_search",
        "base_difficulty": 75,
        "description": "Navigate dynamic shifting obstacles where simple BFS exhausts memory and Euclidean distance under-estimates labyrinthine dead ends."
    },
    {
        "id": "trial_adversarial_counter",
        "name": "The Obsidian Sentinel: Depth-6 Minimax",
        "primary_dimension": "COMBAT",
        "target_island": "island_decision",
        "base_difficulty": 80,
        "description": "Counter a high-energy Guardian that alternates between defensive shield charging and lethal special beam combinations."
    },
    {
        "id": "trial_pareto_evolution",
        "name": "Vortex of the Storm: Multi-Objective Genetic Hull",
        "primary_dimension": "OPTIMIZE",
        "target_island": "island_evolution",
        "base_difficulty": 70,
        "description": "Evolve a lightweight hull capable of withstanding turbulent cross-winds while carrying heavy navigational fuel."
    },
    {
        "id": "trial_regularization_crucible",
        "name": "Neural Overfitting & Adversarial Defense",
        "primary_dimension": "LEARNING",
        "target_island": "island_deep_learning",
        "base_difficulty": 85,
        "description": "Repair a corrupted vision core suffering from 99% train accuracy and severe validation degradation using Dropout and FGSM adversarial training."
    },
    {
        "id": "trial_sparse_rl",
        "name": "Sparse Reward Exploration in the Abyssal Grid",
        "primary_dimension": "PLANNING",
        "target_island": "island_reinforcement_learning",
        "base_difficulty": 78,
        "description": "Tune discount factor and exploration decay so the explorer crosses perilous cliffs without premature convergence to local minima."
    },
    {
        "id": "trial_grounded_rag",
        "name": "The Ancient Archives: Debugging Multi-Agent Consensus",
        "primary_dimension": "KNOWLEDGE",
        "target_island": "island_knowledge",
        "base_difficulty": 72,
        "description": "Retrieve grounded architectural passages and diagnose subtle concurrency synchronization bugs using chunk citations."
    }
]

class OdysseyAdaptationEngine:
    def __init__(self):
        pass

    def evaluate_adaptation(self, player_model: Dict[str, Any], history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        skills = player_model.get("skills", {
            "SEARCH": 65,
            "COMBAT": 70,
            "OPTIMIZE": 50,
            "LEARNING": 60,
            "PLANNING": 55
        })

        telemetry = player_model.get("behavior", {})
        archetype = player_model.get("archetype", "Tactical Strategist")

        # Convert skills to numpy arrays for statistical analysis
        dimensions = list(skills.keys())
        scores = np.array([skills[d] for d in dimensions], dtype=np.float32)

        mean_skill = float(np.mean(scores))
        std_skill = float(np.std(scores))

        # Identify lowest skill (biggest growth opportunity) and highest skill
        min_idx = int(np.argmin(scores))
        max_idx = int(np.argmax(scores))
        weakness_dim = dimensions[min_idx]
        strength_dim = dimensions[max_idx]

        # Calculate utility for each candidate trial
        trial_scores = []
        for trial in CANDIDATE_TRIALS:
            dim = trial["primary_dimension"]
            current_dim_skill = skills.get(dim, 60)

            # 1. Deficit score (higher utility for weaker skills to balance mastery)
            deficit = max(0.0, 100.0 - current_dim_skill)

            # 2. Zone of Proximal Development (ZPD) gap
            # Ideal trial difficulty is slightly above current skill (+10 to +15 points)
            target_difficulty = current_dim_skill + 12.0
            difficulty_diff = abs(trial["base_difficulty"] - target_difficulty)
            zpd_fit = max(0.0, 50.0 - difficulty_diff * 1.5)

            # 3. Information Gain bonus based on archetype tendencies
            info_gain = 20.0
            if archetype == "Speedrunner" and dim in ["OPTIMIZE", "PLANNING"]:
                info_gain += 15.0 # Speedrunners often rush without optimizing
            elif archetype == "Cautious Scholar" and dim in ["COMBAT", "SEARCH"]:
                info_gain += 12.0 # Scholars benefit from active adversary trials

            total_utility = (deficit * 0.45) + (zpd_fit * 0.35) + (info_gain * 0.20)

            trial_scores.append({
                "trial": trial,
                "utility": round(total_utility, 2),
                "zpd_gap": round(trial["base_difficulty"] - current_dim_skill, 1),
                "current_skill": current_dim_skill
            })

        # Rank trials
        trial_scores.sort(key=lambda x: x["utility"], reverse=True)
        recommended = trial_scores[0]

        # Formulate grounded rationale
        rationale = (
            f"The adaptive cognitive engine analyzed your telemetry across {len(dimensions)} intelligence axes. "
            f"While your {strength_dim} mastery is exceptional ({skills[strength_dim]}%), your {weakness_dim} profile "
            f"shows the highest deficit ({skills[weakness_dim]}%). "
            f"Based on your '{archetype}' behavioral model, '{recommended['trial']['name']}' was selected "
            f"with a tailored challenge delta of {recommended['zpd_gap']} points in your Zone of Proximal Development."
        )

        return {
            "recommended_trial": recommended["trial"],
            "recommendation_utility": recommended["utility"],
            "weakness_dimension": weakness_dim,
            "weakness_score": skills[weakness_dim],
            "strength_dimension": strength_dim,
            "strength_score": skills[strength_dim],
            "mean_skill": round(mean_skill, 1),
            "skill_variance": round(std_skill, 2),
            "rationale": rationale,
            "all_ranked_trials": trial_scores
        }

adaptation_engine = OdysseyAdaptationEngine()

