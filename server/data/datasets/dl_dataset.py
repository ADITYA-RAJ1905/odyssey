"""
Emotion Dataset Pool for Island 2: THE MIRROR
Features facial expression portraits, detailed micro-expression cues, and difficulty ratings.
"""

EMOTION_SAMPLES = [
    # EASY: Clear, unmistakable facial expressions
    {
        "id": "emo_easy_1",
        "difficulty": "easy",
        "story": "A young navigator discovers that the lighthouse signal is still operational after the storm.",
        "facial_cues": "Wide crinkled eyes, elevated cheeks (zygomaticus major), open relaxed smile revealing teeth.",
        "actual_emotion": "HAPPY",
        "portrait_type": "joyful_navigator",
        "accent_color": "#22c55e",
        "expression_summary": "Radiant, genuine relief and delight"
    },
    {
        "id": "emo_easy_2",
        "difficulty": "easy",
        "story": "A shipwright inspects the shattered remnants of their flagship grounded upon sharp volcanic reefs.",
        "facial_cues": "Turned-down mouth corners, drooping upper eyelids, vertical forehead furrowing, slumped posture.",
        "actual_emotion": "SAD",
        "portrait_type": "grieving_shipwright",
        "accent_color": "#3b82f6",
        "expression_summary": "Profound sorrow and loss"
    },
    {
        "id": "emo_easy_3",
        "difficulty": "easy",
        "story": "A corsair captain realizes their second-in-command has stolen the water rations and compass.",
        "facial_cues": "Glaring widened eyes, lowered drawn-together brows (corrugator), flared nostrils, tightly pressed lips.",
        "actual_emotion": "ANGRY",
        "portrait_type": "furious_corsair",
        "accent_color": "#ef4444",
        "expression_summary": "Intense indignation and rage"
    },
    {
        "id": "emo_easy_4",
        "difficulty": "easy",
        "story": "A lookout spots an enormous abyssal tentacle rising directly beneath the vessel's hull.",
        "facial_cues": "Wide staring eyes showing upper sclera, raised arched brows, parted lips gasping backward.",
        "actual_emotion": "FEAR",
        "portrait_type": "terrified_lookout",
        "accent_color": "#a855f7",
        "expression_summary": "Acute primal dread"
    },
    {
        "id": "emo_easy_5",
        "difficulty": "easy",
        "story": "A diver opens an ancient basalt chest and a swarm of golden luminescent sea butterflies bursts out.",
        "facial_cues": "Arched raised eyebrows, widened pupils, jaw dropped into an open oval.",
        "actual_emotion": "SURPRISE",
        "portrait_type": "astonished_diver",
        "accent_color": "#eab308",
        "expression_summary": "Sudden unadulterated astonishment"
    },
    {
        "id": "emo_easy_6",
        "difficulty": "easy",
        "story": "An archivist sitting at a wooden desk calmly reading star charts under lantern light.",
        "facial_cues": "Relaxed facial muscles, level mouth line, calm gaze with steady focus.",
        "actual_emotion": "NEUTRAL",
        "portrait_type": "calm_archivist",
        "accent_color": "#94a3b8",
        "expression_summary": "Composed equilibrium"
    },

    # MEDIUM: Subtle / mixed micro-expressions
    {
        "id": "emo_med_1",
        "difficulty": "medium",
        "story": "A lone sailor watches distant harbor fireworks while remembering a fallen comrade.",
        "facial_cues": "Slight upward curl of the lip, but eyes convey heavy moisture and wistful downturned brows.",
        "actual_emotion": "SAD",
        "portrait_type": "bittersweet_sailor",
        "accent_color": "#60a5fa",
        "expression_summary": "Bittersweet melancholy"
    },
    {
        "id": "emo_med_2",
        "difficulty": "medium",
        "story": "A tactician successfully predicts an enemy maneuver, maintaining professional decorum.",
        "facial_cues": "Subtle smirk suppressed at the corner of the mouth, sparkling confident eye crinkles.",
        "actual_emotion": "HAPPY",
        "portrait_type": "composed_tactician",
        "accent_color": "#10b981",
        "expression_summary": "Quiet internal triumph"
    },
    {
        "id": "emo_med_3",
        "difficulty": "medium",
        "story": "An engineer notices an unexpected drop in pressure in the deep diving bell.",
        "facial_cues": "Tense jaw muscle contraction, slight widening of eyelids, brow furrowed in anxious vigilance.",
        "actual_emotion": "FEAR",
        "portrait_type": "vigilant_engineer",
        "accent_color": "#c084fc",
        "expression_summary": "Creeping unease"
    },

    # HARD: Ambiguous / stoic expressions
    {
        "id": "emo_hard_1",
        "difficulty": "hard",
        "story": "An enigmatic tribunal elder listens impassively to an appeal for mercy.",
        "facial_cues": "Minimal muscle movement, micro-tightening of lower eyelids, lips firm without downward tilt.",
        "actual_emotion": "NEUTRAL",
        "portrait_type": "stoic_elder",
        "accent_color": "#64748b",
        "expression_summary": "Inscrutable stoicism"
    },
    {
        "id": "emo_hard_2",
        "difficulty": "hard",
        "story": "A veteran duelist feels a blade narrowly graze their coat in the pitch dark.",
        "facial_cues": "Rapid blink, lips parted barely 2 millimeters, sudden dilation of pupils before composure returns.",
        "actual_emotion": "SURPRISE",
        "portrait_type": "guarded_duelist",
        "accent_color": "#facc15",
        "expression_summary": "Micro-second shock"
    },
    {
        "id": "emo_hard_3",
        "difficulty": "hard",
        "story": "A scout swallowed an unfair command from a corrupt governor without openly objecting.",
        "facial_cues": "Teeth clenched behind closed lips, tight jawline, cold unblinking gaze holding back words.",
        "actual_emotion": "ANGRY",
        "portrait_type": "suppressed_scout",
        "accent_color": "#f87171",
        "expression_summary": "Suppressed simmering rage"
    }
]

DL_EMOTION_SAMPLES = EMOTION_SAMPLES
