import copy
from typing import Dict, Any, List, Optional, Tuple

GUARDIAN_ACTIONS = ["ATTACK", "DEFEND", "HEAL", "SPECIAL"]
PLAYER_ACTIONS = ["ATTACK", "DEFEND", "HEAL", "SPECIAL"]

class CombatState:
    def __init__(self,
                 guardian_hp: int,
                 player_hp: int,
                 guardian_energy: int,
                 player_energy: int,
                 guardian_defending: bool = False,
                 player_defending: bool = False):
        self.guardian_hp = guardian_hp
        self.player_hp = player_hp
        self.guardian_energy = guardian_energy
        self.player_energy = player_energy
        self.guardian_defending = guardian_defending
        self.player_defending = player_defending

    def is_terminal(self) -> bool:
        return self.guardian_hp <= 0 or self.player_hp <= 0

    def evaluate(self) -> float:
        """
        Evaluation function from Guardian (Maximizer) perspective:
        Positive score favors Guardian; Negative score favors Player.
        """
        if self.player_hp <= 0:
            return 1000.0  # Decisive victory for Guardian
        if self.guardian_hp <= 0:
            return -1000.0 # Defeat for Guardian

        score = (self.guardian_hp - self.player_hp) * 2.0
        score += (self.guardian_energy - self.player_energy) * 0.5
        if self.guardian_defending:
            score += 8.0
        if self.player_defending:
            score -= 8.0
        return score

    def apply_action(self, is_guardian: bool, action: str) -> 'CombatState':
        next_s = copy.deepcopy(self)
        if is_guardian:
            next_s.guardian_defending = False
            if action == "ATTACK":
                dmg = 20
                if next_s.player_defending:
                    dmg = int(dmg * 0.4)
                next_s.player_hp = max(0, next_s.player_hp - dmg)
                next_s.guardian_energy = min(60, next_s.guardian_energy + 8)
            elif action == "DEFEND":
                next_s.guardian_defending = True
                next_s.guardian_energy = min(60, next_s.guardian_energy + 12)
            elif action == "HEAL":
                if next_s.guardian_energy >= 20:
                    next_s.guardian_hp = min(100, next_s.guardian_hp + 25)
                    next_s.guardian_energy -= 20
                else:
                    # Penalty for failed energy
                    next_s.guardian_hp = min(100, next_s.guardian_hp + 5)
            elif action == "SPECIAL":
                if next_s.guardian_energy >= 30:
                    dmg = 36
                    if next_s.player_defending:
                        dmg = int(dmg * 0.5)
                    next_s.player_hp = max(0, next_s.player_hp - dmg)
                    next_s.guardian_energy -= 30
                else:
                    # Weak fallback if low energy
                    dmg = 12
                    next_s.player_hp = max(0, next_s.player_hp - dmg)
        else:
            next_s.player_defending = False
            if action == "ATTACK":
                dmg = 22
                if next_s.guardian_defending:
                    dmg = int(dmg * 0.4)
                next_s.guardian_hp = max(0, next_s.guardian_hp - dmg)
                next_s.player_energy = min(60, next_s.player_energy + 8)
            elif action == "DEFEND":
                next_s.player_defending = True
                next_s.player_energy = min(60, next_s.player_energy + 12)
            elif action == "HEAL":
                if next_s.player_energy >= 20:
                    next_s.player_hp = min(100, next_s.player_hp + 28)
                    next_s.player_energy -= 20
            elif action == "SPECIAL":
                if next_s.player_energy >= 30:
                    dmg = 38
                    if next_s.guardian_defending:
                        dmg = int(dmg * 0.5)
                    next_s.guardian_hp = max(0, next_s.guardian_hp - dmg)
                    next_s.player_energy -= 30

        return next_s

class MinimaxGuardianAI:
    def __init__(self, max_depth: int = 4):
        self.max_depth = max_depth
        self.nodes_evaluated = 0
        self.nodes_pruned = 0

    def decide_move(self, state_dict: Dict[str, Any]) -> Dict[str, Any]:
        self.nodes_evaluated = 0
        self.nodes_pruned = 0

        state = CombatState(
            guardian_hp=state_dict.get("guardian_hp", 100),
            player_hp=state_dict.get("player_hp", 100),
            guardian_energy=state_dict.get("guardian_energy", 30),
            player_energy=state_dict.get("player_energy", 30),
            guardian_defending=state_dict.get("guardian_defending", False),
            player_defending=state_dict.get("player_defending", False)
        )

        alpha = -float('inf')
        beta = float('inf')
        best_score = -float('inf')
        best_action = "ATTACK"
        action_analysis = []

        # Guardian is Root (Maximizer)
        for act in GUARDIAN_ACTIONS:
            next_state = state.apply_action(is_guardian=True, action=act)
            self.nodes_evaluated += 1

            # Subtree score (Player's turn to minimize)
            val, subtree = self._min_value(next_state, depth=1, alpha=alpha, beta=beta)
            action_analysis.append({
                "action": act,
                "score": round(val, 2),
                "resulting_guardian_hp": next_state.guardian_hp,
                "resulting_player_hp": next_state.player_hp,
                "sub_tree": subtree
            })

            if val > best_score:
                best_score = val
                best_action = act
            alpha = max(alpha, best_score)

        rationale = f"Evaluated {self.nodes_evaluated} nodes ({self.nodes_pruned} pruned). '{best_action}' yielded the highest minimax utility ({round(best_score, 1)}) across a depth of {self.max_depth} turns."

        return {
            "chosen_action": best_action,
            "minimax_score": round(best_score, 2),
            "nodes_evaluated": self.nodes_evaluated,
            "nodes_pruned": self.nodes_pruned,
            "depth": self.max_depth,
            "action_evaluations": action_analysis,
            "rationale": rationale
        }

    def _max_value(self, state: CombatState, depth: int, alpha: float, beta: float) -> Tuple[float, List[Any]]:
        if depth >= self.max_depth or state.is_terminal():
            return state.evaluate(), []

        v = -float('inf')
        tree = []
        for act in GUARDIAN_ACTIONS:
            self.nodes_evaluated += 1
            next_s = state.apply_action(is_guardian=True, action=act)
            score, sub = self._min_value(next_s, depth + 1, alpha, beta)
            tree.append({"action": act, "score": round(score, 1), "children": sub})

            v = max(v, score)
            if v >= beta:
                self.nodes_pruned += (len(GUARDIAN_ACTIONS) - (tree.index(tree[-1]) + 1))
                return v, tree # Beta cutoff
            alpha = max(alpha, v)
        return v, tree

    def _min_value(self, state: CombatState, depth: int, alpha: float, beta: float) -> Tuple[float, List[Any]]:
        if depth >= self.max_depth or state.is_terminal():
            return state.evaluate(), []

        v = float('inf')
        tree = []
        for act in PLAYER_ACTIONS:
            self.nodes_evaluated += 1
            next_s = state.apply_action(is_guardian=False, action=act)
            score, sub = self._max_value(next_s, depth + 1, alpha, beta)
            tree.append({"action": act, "score": round(score, 1), "children": sub})

            v = min(v, score)
            if v <= alpha:
                self.nodes_pruned += (len(PLAYER_ACTIONS) - (tree.index(tree[-1]) + 1))
                return v, tree # Alpha cutoff
            beta = min(beta, v)
        return v, tree

minimax_guardian = MinimaxGuardianAI(max_depth=4)

