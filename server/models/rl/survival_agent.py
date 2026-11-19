"""
Reinforcement Learning Survival Engine & Q-Learning Agent for Island 5: THE DECISION
Simulates Markov Decision Process (MDP) for island survival.
Computes state-action values Q(s, a) via Bellman value iteration and evaluates player policy alignment.
"""

import copy
from typing import Dict, Any, List, Tuple
from server.data.datasets.rl_dataset import RL_MAPS

ACTIONS = ["UP", "DOWN", "LEFT", "RIGHT", "SEARCH"]
ACTION_DELTAS = {
    "UP": (-1, 0),
    "DOWN": (1, 0),
    "LEFT": (0, -1),
    "RIGHT": (0, 1),
    "SEARCH": (0, 0)
}

class SurvivalRLAgent:
    def __init__(self):
        pass

    def create_game_session(self, difficulty: str = "medium") -> Dict[str, Any]:
        """Initialize a fresh survival run on the selected map."""
        map_config = RL_MAPS.get(difficulty, RL_MAPS["medium"])
        state = {
            "difficulty": difficulty,
            "map_name": map_config["name"],
            "grid_size": map_config["grid_size"],
            "player_pos": list(map_config["start_pos"]),
            "extraction_pos": list(map_config["extraction_pos"]),
            "beacon_pos": list(map_config["beacon_pos"]),
            "tiles": copy.deepcopy(map_config["tiles"]),
            "hazards": copy.deepcopy(map_config.get("hazards", [])),
            "health": 100,
            "food": 100,
            "water": 100,
            "turn": 0,
            "max_turns": map_config["max_turns"],
            "beacon_collected": False,
            "status": "ACTIVE", # ACTIVE, WON, DIED, TIMEOUT
            "turns_history": [],
            "policy_matches": 0,
            "total_decisions": 0
        }
        # Precompute initial Q-values
        state["current_q_values"], state["recommended_action"] = self.compute_q_values(state)
        return state

    def compute_q_values(self, state: Dict[str, Any]) -> Tuple[Dict[str, float], str]:
        """
        Compute Bellman Q-values Q(s, a) for all candidate actions in the current state.
        Considers:
        - Target destination (Beacon if uncollected, else Extraction Beach)
        - Resource urgency (dehydration / starvation penalties)
        - Hazard avoidance
        - Boundary constraints
        """
        grid_size = state["grid_size"]
        curr_r, curr_c = state["player_pos"]
        beacon_collected = state["beacon_collected"]
        target = state["extraction_pos"] if beacon_collected else state["beacon_pos"]
        tr, tc = target

        q_values = {}
        for action in ACTIONS:
            dr, dc = ACTION_DELTAS[action]
            nr, nc = curr_r + dr, curr_c + dc

            # Out of bounds penalty
            if nr < 0 or nr >= grid_size or nc < 0 or nc >= grid_size:
                q_values[action] = -99.0
                continue

            if action == "SEARCH":
                # Searching on beacon tile yields huge value if not yet found
                if not beacon_collected and [curr_r, curr_c] == state["beacon_pos"]:
                    q_values[action] = 85.0
                else:
                    q_values[action] = -10.0 # wasting a turn
                continue

            # Base distance reward (closer to objective = higher value)
            curr_dist = abs(curr_r - tr) + abs(curr_c - tc)
            next_dist = abs(nr - tr) + abs(nc - tc)
            dist_delta = curr_dist - next_dist # positive if getting closer
            q_val = dist_delta * 18.0

            # Target arrival bonus
            if [nr, nc] == target:
                q_val += 60.0

            # Tile type evaluations
            tile_type = state["tiles"][nr][nc]
            if tile_type == "WATER":
                thirst_deficit = 100 - state["water"]
                q_val += (thirst_deficit * 0.35)
            elif tile_type == "BERRY":
                hunger_deficit = 100 - state["food"]
                q_val += (hunger_deficit * 0.25)
            elif tile_type == "SHELTER":
                health_deficit = 100 - state["health"]
                q_val += (health_deficit * 0.30)
            elif tile_type == "BEACON" and not beacon_collected:
                q_val += 45.0

            # Hazard avoidance
            for h in state["hazards"]:
                if h["pos"] == [nr, nc]:
                    q_val -= (h["penalty"] * 2.2)

            q_values[action] = round(q_val, 1)

        best_action = max(q_values.items(), key=lambda x: x[1])[0]
        return q_values, best_action

    def step(self, state: Dict[str, Any], action: str) -> Dict[str, Any]:
        """Execute a step in the survival environment."""
        if state["status"] != "ACTIVE":
            return state

        action = action.upper()
        if action not in ACTIONS:
            action = "SEARCH"

        current_q_values, optimal_action = self.compute_q_values(state)
        is_policy_match = (action == optimal_action)
        q_difference = round(current_q_values[optimal_action] - current_q_values.get(action, -99.0), 1)

        dr, dc = ACTION_DELTAS[action]
        curr_r, curr_c = state["player_pos"]
        grid_size = state["grid_size"]

        events = []

        if action == "SEARCH":
            events.append("You scour the immediate area.")
            if not state["beacon_collected"] and [curr_r, curr_c] == state["beacon_pos"]:
                state["beacon_collected"] = True
                events.append("★ SUCCESS: You located and activated the Emergency Radio Beacon! Head to the extraction beach!")
        else:
            nr, nc = curr_r + dr, curr_c + dc
            if 0 <= nr < grid_size and 0 <= nc < grid_size:
                state["player_pos"] = [nr, nc]
                events.append(f"Moved {action.lower()} into sector [{nr}, {nc}].")

                # Check auto beacon pickup if stepped on
                if [nr, nc] == state["beacon_pos"] and not state["beacon_collected"]:
                    state["beacon_collected"] = True
                    events.append("★ You found the Radio Beacon transmitter!")

                # Handle tile interaction
                tile = state["tiles"][nr][nc]
                if tile == "WATER":
                    restored = min(35, 100 - state["water"])
                    state["water"] += restored
                    events.append(f"Drank from freshwater spring (+{restored} Water).")
                elif tile == "BERRY":
                    restored = min(35, 100 - state["food"])
                    state["food"] += restored
                    events.append(f"Foraged wild island berries (+{restored} Food).")
                elif tile == "SHELTER":
                    restored = min(25, 100 - state["health"])
                    state["health"] += restored
                    events.append(f"Rested under stone canopy shelter (+{restored} Health).")

                # Handle hazards
                for h in state["hazards"]:
                    if h["pos"] == [nr, nc]:
                        penalty = h["penalty"]
                        state["health"] = max(0, state["health"] - penalty)
                        hazard_name = h["type"].replace("HAZARD_", "").title()
                        events.append(f"⚠ AMBUSH! {hazard_name} caught you (-{penalty} Health)!")
            else:
                events.append("Impassable jagged rock face! Movement blocked.")

        # Resource degradation per turn
        state["water"] = max(0, state["water"] - 8)
        state["food"] = max(0, state["food"] - 5)

        # Starvation / Dehydration damage
        if state["water"] == 0:
            state["health"] = max(0, state["health"] - 15)
            events.append("Severe dehydration! Health dropping rapidly (-15 HP).")
        if state["food"] == 0:
            state["health"] = max(0, state["health"] - 10)
            events.append("Starvation! Health dropping (-10 HP).")

        state["turn"] += 1
        state["total_decisions"] += 1
        if is_policy_match:
            state["policy_matches"] += 1

        # Check Win / Loss conditions
        if state["player_pos"] == state["extraction_pos"] and state["beacon_collected"]:
            state["status"] = "WON"
            events.append("🏆 RESCUE EXTRACTION SUCCESSFUL! You signaled the rescue helicopter and survived the island!")
        elif state["health"] <= 0:
            state["status"] = "DIED"
            events.append("☠ VITALS CRITICAL. You collapsed from injuries and exposure.")
        elif state["turn"] >= state["max_turns"]:
            state["status"] = "TIMEOUT"
            events.append("⌛ The extraction window closed. Night storm engulfed the island.")

        # Recompute next Q-values if still active
        next_q_values, next_opt = self.compute_q_values(state)
        state["current_q_values"] = next_q_values
        state["recommended_action"] = next_opt

        step_log = {
            "turn": state["turn"],
            "action": action,
            "optimal_action": optimal_action,
            "is_policy_match": is_policy_match,
            "q_difference": q_difference,
            "q_values": current_q_values,
            "events": events,
            "vitals": {
                "health": state["health"],
                "food": state["food"],
                "water": state["water"]
            }
        }
        state["turns_history"].append(step_log)

        return {
            "state": state,
            "step_summary": step_log,
            "policy_alignment_pct": round((state["policy_matches"] / max(1, state["total_decisions"])) * 100, 1)
        }

rl_agent = SurvivalRLAgent()

