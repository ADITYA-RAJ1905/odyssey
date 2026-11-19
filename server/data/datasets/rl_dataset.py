"""
Reinforcement Learning Environment Maps for Island 5: THE DECISION
Defines survival grid architectures across difficulty tiers.
"""

from typing import Dict, Any, List

RL_MAPS: Dict[str, Dict[str, Any]] = {
    "easy": {
        "grid_size": 5,
        "start_pos": [0, 0],
        "extraction_pos": [4, 4],
        "beacon_pos": [2, 2],
        "max_turns": 16,
        "name": "Sunlit Atoll",
        "tiles": [
            ["START", "EMPTY", "WATER", "EMPTY", "EMPTY"],
            ["EMPTY", "BERRY", "EMPTY", "EMPTY", "SHELTER"],
            ["WATER", "EMPTY", "BEACON", "EMPTY", "EMPTY"],
            ["EMPTY", "EMPTY", "EMPTY", "BERRY", "EMPTY"],
            ["SHELTER", "EMPTY", "EMPTY", "EMPTY", "EXTRACTION"]
        ],
        "hazards": [
            {"pos": [1, 3], "type": "HAZARD_BRAMBLE", "penalty": 15}
        ]
    },
    "medium": {
        "grid_size": 6,
        "start_pos": [0, 0],
        "extraction_pos": [5, 5],
        "beacon_pos": [2, 4],
        "max_turns": 18,
        "name": "Jagged Mangrove",
        "tiles": [
            ["START", "EMPTY", "HAZARD_SWAMP", "WATER", "EMPTY", "EMPTY"],
            ["EMPTY", "BERRY", "EMPTY", "EMPTY", "HAZARD_BEAST", "EMPTY"],
            ["EMPTY", "EMPTY", "SHELTER", "EMPTY", "BEACON", "EMPTY"],
            ["WATER", "HAZARD_SWAMP", "EMPTY", "EMPTY", "EMPTY", "BERRY"],
            ["EMPTY", "EMPTY", "BERRY", "SHELTER", "EMPTY", "EMPTY"],
            ["EMPTY", "WATER", "EMPTY", "EMPTY", "EMPTY", "EXTRACTION"]
        ],
        "hazards": [
            {"pos": [0, 2], "type": "HAZARD_SWAMP", "penalty": 20},
            {"pos": [1, 4], "type": "HAZARD_BEAST", "penalty": 30},
            {"pos": [3, 1], "type": "HAZARD_SWAMP", "penalty": 20}
        ]
    },
    "hard": {
        "grid_size": 6,
        "start_pos": [0, 0],
        "extraction_pos": [5, 5],
        "beacon_pos": [4, 1],
        "max_turns": 17,
        "name": "Volcanic Caldera",
        "tiles": [
            ["START", "HAZARD_QUAKE", "EMPTY", "WATER", "EMPTY", "EMPTY"],
            ["EMPTY", "EMPTY", "HAZARD_LAVA", "EMPTY", "BERRY", "EMPTY"],
            ["WATER", "HAZARD_BEAST", "EMPTY", "EMPTY", "EMPTY", "SHELTER"],
            ["EMPTY", "EMPTY", "SHELTER", "HAZARD_LAVA", "EMPTY", "EMPTY"],
            ["EMPTY", "BEACON", "EMPTY", "EMPTY", "HAZARD_QUAKE", "EMPTY"],
            ["EMPTY", "EMPTY", "WATER", "EMPTY", "EMPTY", "EXTRACTION"]
        ],
        "hazards": [
            {"pos": [0, 1], "type": "HAZARD_QUAKE", "penalty": 25},
            {"pos": [1, 2], "type": "HAZARD_LAVA", "penalty": 35},
            {"pos": [2, 1], "type": "HAZARD_BEAST", "penalty": 30},
            {"pos": [3, 3], "type": "HAZARD_LAVA", "penalty": 35},
            {"pos": [4, 4], "type": "HAZARD_QUAKE", "penalty": 25}
        ]
    }
}

