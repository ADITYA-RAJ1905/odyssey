"""
Computer Vision Dataset for Island 3: THE OBSERVER
Rich annotated scenes representing drone scans and optical reconnaissance across the archipelago.
Each sample has bounding boxes, class counts, and targeted perception questions.
"""

from typing import Dict, Any, List

CV_SCENES: List[Dict[str, Any]] = [
    # EASY SCENES
    {
        "id": "cv_easy_1",
        "difficulty": "easy",
        "title": "Shipwreck Shoal Recon",
        "description": "Aerial drone scan over the reef shallows. Optical sensors have captured cargo crates washed ashore.",
        "scene_type": "beach",
        "svg_elements": [
            {"type": "sky", "color": "#0f172a"},
            {"type": "ocean", "color": "#0284c7"},
            {"type": "sand", "color": "#ca8a04"},
            {"type": "object", "label": "crate", "box": [80, 220, 150, 280], "color": "#b45309"},
            {"type": "object", "label": "crate", "box": [220, 240, 290, 300], "color": "#b45309"},
            {"type": "object", "label": "crate", "box": [350, 210, 420, 270], "color": "#b45309"},
            {"type": "object", "label": "lifeboat", "box": [480, 160, 600, 250], "color": "#ea580c"},
            {"type": "object", "label": "seagull", "box": [280, 50, 330, 80], "color": "#f8fafc"},
            {"type": "object", "label": "seagull", "box": [420, 70, 470, 100], "color": "#f8fafc"}
        ],
        "objects": [
            {"id": "obj_1", "label": "crate", "box": [80, 220, 150, 280], "confidence": 0.94},
            {"id": "obj_2", "label": "crate", "box": [220, 240, 290, 300], "confidence": 0.92},
            {"id": "obj_3", "label": "crate", "box": [350, 210, 420, 270], "confidence": 0.89},
            {"id": "obj_4", "label": "lifeboat", "box": [480, 160, 600, 250], "confidence": 0.96},
            {"id": "obj_5", "label": "seagull", "box": [280, 50, 330, 80], "confidence": 0.86},
            {"id": "obj_6", "label": "seagull", "box": [420, 70, 470, 100], "confidence": 0.88}
        ],
        "question": "How many supply crates are detected on the shoreline?",
        "question_type": "count",
        "target_class": "crate",
        "options": ["1", "2", "3", "4"],
        "correct_answer": "3",
        "explanation": "Object detector localized 3 distinct rectangular wooden cargo contours with IoU > 0.85 and confidence >= 0.89."
    },
    {
        "id": "cv_easy_2",
        "difficulty": "easy",
        "title": "Harbor Patrol Outpost",
        "description": "Forward observation sensor overlooking the old harbor pier. Docked navigation craft detected.",
        "scene_type": "harbor",
        "svg_elements": [
            {"type": "ocean", "color": "#0369a1"},
            {"type": "pier", "color": "#475569"},
            {"type": "object", "label": "patrol_boat", "box": [120, 140, 260, 230], "color": "#38bdf8"},
            {"type": "object", "label": "patrol_boat", "box": [320, 150, 460, 240], "color": "#38bdf8"},
            {"type": "object", "label": "buoy", "box": [520, 190, 560, 250], "color": "#ef4444"},
            {"type": "object", "label": "lighthouse", "box": [50, 40, 100, 200], "color": "#e2e8f0"}
        ],
        "objects": [
            {"id": "obj_1", "label": "patrol_boat", "box": [120, 140, 260, 230], "confidence": 0.95},
            {"id": "obj_2", "label": "patrol_boat", "box": [320, 150, 460, 240], "confidence": 0.93},
            {"id": "obj_3", "label": "buoy", "box": [520, 190, 560, 250], "confidence": 0.91},
            {"id": "obj_4", "label": "lighthouse", "box": [50, 40, 100, 200], "confidence": 0.98}
        ],
        "question": "Is an emergency marker buoy present in the waters?",
        "question_type": "boolean",
        "target_class": "buoy",
        "options": ["YES", "NO"],
        "correct_answer": "YES",
        "explanation": "A high-vis navigation buoy was localized at [520, 190, 560, 250] with 91% confidence score."
    },
    {
        "id": "cv_easy_3",
        "difficulty": "easy",
        "title": "Airstrip Runway Scan",
        "description": "Satellite optical feed over the cracked jungle runway. Checking for operational aerial transport.",
        "scene_type": "airstrip",
        "svg_elements": [
            {"type": "asphalt", "color": "#334155"},
            {"type": "jungle", "color": "#14532d"},
            {"type": "object", "label": "prop_plane", "box": [180, 100, 360, 240], "color": "#f1f5f9"},
            {"type": "object", "label": "fuel_drum", "box": [420, 180, 460, 230], "color": "#dc2626"},
            {"type": "object", "label": "fuel_drum", "box": [480, 180, 520, 230], "color": "#dc2626"}
        ],
        "objects": [
            {"id": "obj_1", "label": "prop_plane", "box": [180, 100, 360, 240], "confidence": 0.97},
            {"id": "obj_2", "label": "fuel_drum", "box": [420, 180, 460, 230], "confidence": 0.90},
            {"id": "obj_3", "label": "fuel_drum", "box": [480, 180, 520, 230], "confidence": 0.92}
        ],
        "question": "What is the primary vehicle detected parked on the tarmac?",
        "question_type": "classification",
        "target_class": "prop_plane",
        "options": ["Cargo Truck", "Propeller Plane", "Helicopter", "Submersible"],
        "correct_answer": "Propeller Plane",
        "explanation": "A twin-wing propeller aircraft was detected with 97% confidence occupying the central runway coordinate."
    },

    # MEDIUM SCENES
    {
        "id": "cv_med_1",
        "difficulty": "medium",
        "title": "Dense Canopy Drone Thermal/Optical",
        "description": "Low-altitude drone surveying movement within the bamboo jungle perimeter.",
        "scene_type": "jungle",
        "svg_elements": [
            {"type": "canopy", "color": "#064e3b"},
            {"type": "path", "color": "#78350f"},
            {"type": "object", "label": "researcher", "box": [150, 130, 190, 210], "color": "#3b82f6"},
            {"type": "object", "label": "researcher", "box": [220, 140, 260, 220], "color": "#3b82f6"},
            {"type": "object", "label": "panther", "box": [390, 160, 460, 220], "color": "#1e293b"},
            {"type": "object", "label": "motion_sensor", "box": [100, 90, 130, 130], "color": "#eab308"},
            {"type": "object", "label": "motion_sensor", "box": [320, 80, 350, 120], "color": "#eab308"},
            {"type": "object", "label": "backpack", "box": [185, 170, 210, 205], "color": "#f97316"}
        ],
        "objects": [
            {"id": "obj_1", "label": "researcher", "box": [150, 130, 190, 210], "confidence": 0.88},
            {"id": "obj_2", "label": "researcher", "box": [220, 140, 260, 220], "confidence": 0.84},
            {"id": "obj_3", "label": "panther", "box": [390, 160, 460, 220], "confidence": 0.79},
            {"id": "obj_4", "label": "motion_sensor", "box": [100, 90, 130, 130], "confidence": 0.82},
            {"id": "obj_5", "label": "motion_sensor", "box": [320, 80, 350, 120], "confidence": 0.85},
            {"id": "obj_6", "label": "backpack", "box": [185, 170, 210, 205], "confidence": 0.76}
        ],
        "question": "How many human explorers (researchers) are identified in this jungle sector?",
        "question_type": "count",
        "target_class": "researcher",
        "options": ["1", "2", "3", "4"],
        "correct_answer": "2",
        "explanation": "Human silhouette keypoints identified 2 bipedal profiles along the footpath. A wild feline was distinguished separately."
    },
    {
        "id": "cv_med_2",
        "difficulty": "medium",
        "title": "Submerged Reef Perimeter",
        "description": "Underwater sonar & optical camera sweep along the coral drop-off where escape routes might exist.",
        "scene_type": "underwater",
        "svg_elements": [
            {"type": "water", "color": "#082f49"},
            {"type": "coral", "color": "#be185d"},
            {"type": "object", "label": "shark", "box": [340, 90, 460, 170], "color": "#64748b"},
            {"type": "object", "label": "sea_turtle", "box": [120, 160, 210, 230], "color": "#059669"},
            {"type": "object", "label": "diving_tank", "box": [240, 210, 280, 260], "color": "#facc15"},
            {"type": "object", "label": "shipwreck_hull", "box": [420, 180, 580, 300], "color": "#475569"}
        ],
        "objects": [
            {"id": "obj_1", "label": "shark", "box": [340, 90, 460, 170], "confidence": 0.91},
            {"id": "obj_2", "label": "sea_turtle", "box": [120, 160, 210, 230], "confidence": 0.87},
            {"id": "obj_3", "label": "diving_tank", "box": [240, 210, 280, 260], "confidence": 0.81},
            {"id": "obj_4", "label": "shipwreck_hull", "box": [420, 180, 580, 300], "confidence": 0.93}
        ],
        "question": "Is an apex predator (shark) detected swimming above the shipwreck?",
        "question_type": "boolean",
        "target_class": "shark",
        "options": ["YES", "NO"],
        "correct_answer": "YES",
        "explanation": "Dorsal fin and hydrodynamic contour classified as a marine predator with 91% confidence."
    },
    {
        "id": "cv_med_3",
        "difficulty": "medium",
        "title": "Communication Mast Station",
        "description": "Rooftop optical sweep of the island's abandoned telemetry antenna complex.",
        "scene_type": "station",
        "svg_elements": [
            {"type": "sky", "color": "#1e1b4b"},
            {"type": "building", "color": "#334155"},
            {"type": "object", "label": "satellite_dish", "box": [140, 60, 220, 140], "color": "#94a3b8"},
            {"type": "object", "label": "solar_panel", "box": [280, 160, 370, 210], "color": "#1e3a8a"},
            {"type": "object", "label": "solar_panel", "box": [390, 160, 480, 210], "color": "#1e3a8a"},
            {"type": "object", "label": "solar_panel", "box": [500, 160, 590, 210], "color": "#1e3a8a"},
            {"type": "object", "label": "battery_pack", "box": [220, 190, 260, 240], "color": "#16a34a"}
        ],
        "objects": [
            {"id": "obj_1", "label": "satellite_dish", "box": [140, 60, 220, 140], "confidence": 0.92},
            {"id": "obj_2", "label": "solar_panel", "box": [280, 160, 370, 210], "confidence": 0.89},
            {"id": "obj_3", "label": "solar_panel", "box": [390, 160, 480, 210], "confidence": 0.91},
            {"id": "obj_4", "label": "solar_panel", "box": [500, 160, 590, 210], "confidence": 0.88},
            {"id": "obj_5", "label": "battery_pack", "box": [220, 190, 260, 240], "confidence": 0.83}
        ],
        "question": "How many solar energy panels are arrayed on the telemetry roof?",
        "question_type": "count",
        "target_class": "solar_panel",
        "options": ["2", "3", "4", "5"],
        "correct_answer": "3",
        "explanation": "Grid array segmentation extracted 3 photovoltaic rectangular cells with 89-91% model certainty."
    },

    # HARD SCENES (Dense, subtle, occluded)
    {
        "id": "cv_hard_1",
        "difficulty": "hard",
        "title": "Storm-Swept Archipelago Anchorage",
        "description": "Infrared night-vision scan through heavy torrential rain. Objects are partially occluded by water glare.",
        "scene_type": "storm_night",
        "svg_elements": [
            {"type": "night_sky", "color": "#020617"},
            {"type": "turbulent_sea", "color": "#0f172a"},
            {"type": "object", "label": "emergency_raft", "box": [90, 180, 170, 240], "color": "#ea580c"},
            {"type": "object", "label": "survivor_flare", "box": [190, 80, 220, 110], "color": "#ef4444"},
            {"type": "object", "label": "cargo_container", "box": [260, 150, 390, 230], "color": "#0284c7"},
            {"type": "object", "label": "debris_drift", "box": [420, 200, 480, 240], "color": "#57534e"},
            {"type": "object", "label": "distress_beacon", "box": [120, 160, 145, 190], "color": "#22c55e"},
            {"type": "object", "label": "cargo_container", "box": [470, 130, 580, 210], "color": "#b91c1c"}
        ],
        "objects": [
            {"id": "obj_1", "label": "emergency_raft", "box": [90, 180, 170, 240], "confidence": 0.74},
            {"id": "obj_2", "label": "survivor_flare", "box": [190, 80, 220, 110], "confidence": 0.81},
            {"id": "obj_3", "label": "cargo_container", "box": [260, 150, 390, 230], "confidence": 0.77},
            {"id": "obj_4", "label": "debris_drift", "box": [420, 200, 480, 240], "confidence": 0.62},
            {"id": "obj_5", "label": "distress_beacon", "box": [120, 160, 145, 190], "confidence": 0.71},
            {"id": "obj_6", "label": "cargo_container", "box": [470, 130, 580, 210], "confidence": 0.73}
        ],
        "question": "Despite wave occlusion, how many floating shipping containers are adrift?",
        "question_type": "count",
        "target_class": "cargo_container",
        "options": ["1", "2", "3", "4"],
        "correct_answer": "2",
        "explanation": "Convolutional feature maps identified 2 metallic geometric bodies floating at [260,150] and [470,130]."
    },
    {
        "id": "cv_hard_2",
        "difficulty": "hard",
        "title": "Subterranean Bunkers Entrance",
        "description": "Low-light multispectral surveillance of hidden cave entrance fortified by past researchers.",
        "scene_type": "bunker",
        "svg_elements": [
            {"type": "rock_face", "color": "#1c1917"},
            {"type": "blast_door", "color": "#44403c"},
            {"type": "object", "label": "keypad_console", "box": [210, 150, 250, 190], "color": "#06b6d4"},
            {"type": "object", "label": "surveillance_camera", "box": [180, 60, 210, 90], "color": "#dc2626"},
            {"type": "object", "label": "surveillance_camera", "box": [390, 50, 420, 80], "color": "#dc2626"},
            {"type": "object", "label": "generator", "box": [450, 160, 540, 240], "color": "#ca8a04"},
            {"type": "object", "label": "tripwire_laser", "box": [230, 210, 360, 220], "color": "#f43f5e"}
        ],
        "objects": [
            {"id": "obj_1", "label": "keypad_console", "box": [210, 150, 250, 190], "confidence": 0.82},
            {"id": "obj_2", "label": "surveillance_camera", "box": [180, 60, 210, 90], "confidence": 0.76},
            {"id": "obj_3", "label": "surveillance_camera", "box": [390, 50, 420, 80], "confidence": 0.78},
            {"id": "obj_4", "label": "generator", "box": [450, 160, 540, 240], "confidence": 0.85},
            {"id": "obj_5", "label": "tripwire_laser", "box": [230, 210, 360, 220], "confidence": 0.69}
        ],
        "question": "How many automated optical security cameras monitor the blast door perimeter?",
        "question_type": "count",
        "target_class": "surveillance_camera",
        "options": ["1", "2", "3", "4"],
        "correct_answer": "2",
        "explanation": "Two dome camera housings were detected mounted on the upper rock corners with infrared reflections."
    }
]

def get_cv_challenges_by_difficulty(difficulty: str) -> List[Dict[str, Any]]:
    return [s for s in CV_SCENES if s["difficulty"] == difficulty]

