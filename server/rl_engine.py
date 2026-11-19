import numpy as np
from typing import Dict, Any, List, Tuple

# Actions: 0: UP, 1: RIGHT, 2: DOWN, 3: LEFT
ACTIONS = [(-1, 0), (0, 1), (1, 0), (0, -1)]
ACTION_NAMES = ["UP", "RIGHT", "DOWN", "LEFT"]

class GridWorldEnv:
    def __init__(self, width: int = 6, height: int = 6):
        self.width = width
        self.height = height
        self.start = (0, 0)
        self.goal = (width - 1, height - 1)

        # Dangerous cliffs / hazards
        self.cliffs = {(1, 2), (2, 2), (3, 2), (4, 4), (2, 4)}
        # Energy relics
        self.relics = {(1, 0), (3, 4), (0, 4)}
        self.reset()

    def reset(self):
        self.agent_pos = self.start
        self.collected_relics = set()
        return self.state_index(self.agent_pos)

    def state_index(self, pos: Tuple[int, int]) -> int:
        return pos[0] * self.width + pos[1]

    def index_to_pos(self, idx: int) -> Tuple[int, int]:
        return (idx // self.width, idx % self.width)

    def step(self, action_idx: int) -> Tuple[int, float, bool, Dict[str, Any]]:
        dr, dc = ACTIONS[action_idx]
        nr = max(0, min(self.height - 1, self.agent_pos[0] + dr))
        nc = max(0, min(self.width - 1, self.agent_pos[1] + dc))
        new_pos = (nr, nc)
        self.agent_pos = new_pos

        # Check conditions
        if new_pos == self.goal:
            return self.state_index(new_pos), 100.0, True, {"event": "goal"}
        elif new_pos in self.cliffs:
            return self.state_index(new_pos), -60.0, True, {"event": "cliff_fall"}
        elif new_pos in self.relics and new_pos not in self.collected_relics:
            self.collected_relics.add(new_pos)
            return self.state_index(new_pos), 15.0, False, {"event": "relic_found"}
        else:
            return self.state_index(new_pos), -1.0, False, {"event": "step"}

class OdysseyQAgent:
    def __init__(self, width: int = 6, height: int = 6):
        self.env = GridWorldEnv(width, height)
        self.num_states = width * height
        self.num_actions = 4
        self.q_table = np.zeros((self.num_states, self.num_actions), dtype=np.float32)

    def reset_q_table(self):
        self.q_table = np.zeros((self.num_states, self.num_actions), dtype=np.float32)

    def train_simulation(self,
                         num_episodes: int = 300,
                         alpha: float = 0.15,
                         gamma: float = 0.95,
                         initial_epsilon: float = 1.0,
                         min_epsilon: float = 0.05,
                         epsilon_decay: float = 0.99) -> Dict[str, Any]:
        """
        Executes real Q-Learning on the dangerous grid terrain.
        Q(s, a) <- Q(s, a) + alpha * [r + gamma * max_a' Q(s', a') - Q(s, a)]
        """
        self.reset_q_table()
        epsilon = initial_epsilon

        episode_logs = []
        reward_history = []
        success_history = []
        sample_trajectories = {}
        sample_milestones = {1, 20, 50, 100, 200, num_episodes}

        running_reward = 0.0
        success_count = 0

        for ep in range(1, num_episodes + 1):
            s = self.env.reset()
            total_reward = 0.0
            steps = 0
            trajectory = [self.env.index_to_pos(s)]
            done = False

            while not done and steps < 60:
                steps += 1
                # Epsilon-greedy action selection
                if np.random.rand() < epsilon:
                    a = np.random.randint(self.num_actions)
                else:
                    # Choose action with highest Q-value (break ties randomly)
                    q_vals = self.q_table[s]
                    max_val = np.max(q_vals)
                    best_actions = np.where(q_vals == max_val)[0]
                    a = np.random.choice(best_actions)

                s_next, reward, done, info = self.env.step(a)
                trajectory.append(self.env.index_to_pos(s_next))
                total_reward += reward

                # Real Q-Learning Bellman update
                best_next_q = np.max(self.q_table[s_next]) if not done else 0.0
                td_target = reward + gamma * best_next_q
                td_error = td_target - self.q_table[s, a]
                self.q_table[s, a] += alpha * td_error

                s = s_next

            # Decay exploration rate
            epsilon = max(min_epsilon, epsilon * epsilon_decay)

            is_success = (info.get("event") == "goal")
            if is_success:
                success_count += 1

            reward_history.append(round(float(total_reward), 2))
            success_history.append(1 if is_success else 0)
            running_reward = 0.9 * running_reward + 0.1 * total_reward

            # Record sampled milestone trajectories for frontend animation
            if ep in sample_milestones:
                sample_trajectories[str(ep)] = {
                    "episode": ep,
                    "path": [{"r": p[0], "c": p[1]} for p in trajectory],
                    "reward": round(float(total_reward), 2),
                    "steps": steps,
                    "reached_goal": is_success,
                    "epsilon": round(float(epsilon), 3)
                }

            # Batch logging every 10 episodes
            if ep % 5 == 0 or ep == 1:
                recent_succ_rate = np.mean(success_history[-20:]) if len(success_history) >= 20 else np.mean(success_history)
                episode_logs.append({
                    "episode": ep,
                    "reward": round(float(total_reward), 2),
                    "avg_reward": round(float(running_reward), 2),
                    "steps": steps,
                    "epsilon": round(float(epsilon), 3),
                    "success_rate": round(float(recent_succ_rate * 100), 1)
                })

        # Calculate optimal policy arrows and state value map V(s) = max_a Q(s, a)
        grid_policy = []
        for r in range(self.env.height):
            row_policy = []
            for c in range(self.env.width):
                pos = (r, c)
                s_idx = self.env.state_index(pos)
                if pos == self.env.goal:
                    cell_type = "goal"
                    best_act = "GOAL"
                    max_q = 100.0
                elif pos in self.env.cliffs:
                    cell_type = "cliff"
                    best_act = "DANGER"
                    max_q = -60.0
                else:
                    cell_type = "relic" if pos in self.env.relics else "normal"
                    q_vals = self.q_table[s_idx]
                    best_act_idx = int(np.argmax(q_vals))
                    best_act = ACTION_NAMES[best_act_idx]
                    max_q = float(np.max(q_vals))

                row_policy.append({
                    "r": r,
                    "c": c,
                    "type": cell_type,
                    "best_action": best_act,
                    "max_q": round(max_q, 2),
                    "q_values": [round(float(v), 2) for v in self.q_table[s_idx]]
                })
            grid_policy.append(row_policy)

        return {
            "total_episodes": num_episodes,
            "final_epsilon": round(float(epsilon), 4),
            "final_success_rate": round(float(np.mean(success_history[-30:]) * 100), 1),
            "episode_logs": episode_logs,
            "sample_trajectories": sample_trajectories,
            "policy_grid": grid_policy,
            "env_metadata": {
                "width": self.env.width,
                "height": self.env.height,
                "start": self.env.start,
                "goal": self.env.goal,
                "cliffs": list(self.env.cliffs),
                "relics": list(self.env.relics)
            }
        }

    def train_echo_pond(self, whirlpools: List[List[int]] = None, crystals: List[List[int]] = None) -> Dict[str, Any]:
        # Customize pond
        if whirlpools:
            self.env.cliffs = {tuple(w) for w in whirlpools}
        if crystals:
            self.env.relics = {tuple(c) for c in crystals}

        # Run training
        res = self.train_simulation(num_episodes=300, alpha=0.18, gamma=0.95, initial_epsilon=1.0, epsilon_decay=0.985)

        trajs = res["sample_trajectories"]
        baby = trajs.get("1") or list(trajs.values())[0]
        learning = trajs.get("50") or trajs.get("20") or list(trajs.values())[min(1, len(trajs)-1)]
        master = trajs.get("300") or trajs.get("200") or list(trajs.values())[-1]

        return {
            "baby_echo": baby,
            "learning_echo": learning,
            "master_echo": master,
            "final_success_rate": res["final_success_rate"],
            "convergence_rate": res["final_success_rate"],
            "policy_grid": res["policy_grid"],
            "env_metadata": res["env_metadata"]
        }

rl_engine = OdysseyQAgent()


