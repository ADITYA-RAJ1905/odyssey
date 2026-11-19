"""
NLP Dataset for Island 4: THE VOICES
Contains curated survivor transmissions, intercepted radio logs, and bottle distress notes.
Modes:
1. Sentiment (Positive / Negative / Neutral)
2. Emotion (Joy / Anger / Fear / Sadness / Surprise / Disgust)
3. Intent (Distress Beacon / Trade Offer / Warning Hazard / Navigation Query / Friendly Greeting)
4. Sarcasm (Sarcastic vs. Sincere)
"""

from typing import Dict, Any, List

NLP_CHALLENGES: List[Dict[str, Any]] = [
    # --- SENTIMENT SAMPLES ---
    {
        "id": "nlp_sent_1",
        "category": "sentiment",
        "difficulty": "easy",
        "title": "Fresh Spring Water Log",
        "text": "The freshwater stream cascading off the northern basalt ridge tastes sweeter than anything back home. We have enough clean water for weeks!",
        "options": ["POSITIVE", "NEGATIVE", "NEUTRAL"],
        "correct_answer": "POSITIVE",
        "tokens_salient": ["sweeter", "enough clean water", "freshwater stream"],
        "explanation": "High concentration of positive sentiment indicators ('sweeter', 'clean water', 'enough for weeks')."
    },
    {
        "id": "nlp_sent_2",
        "category": "sentiment",
        "difficulty": "easy",
        "title": "Storm Damaged Raft Log",
        "text": "The tide ripped off the rudder and the main keel is completely shattered. We are dead in the water, drenched and shivering.",
        "options": ["POSITIVE", "NEGATIVE", "NEUTRAL"],
        "correct_answer": "NEGATIVE",
        "tokens_salient": ["ripped off", "completely shattered", "dead in the water", "shivering"],
        "explanation": "Clear distress and damage markers showing overwhelming negative valence."
    },
    {
        "id": "nlp_sent_3",
        "category": "sentiment",
        "difficulty": "medium",
        "title": "Atmospheric Pressure Reading",
        "text": "Barometric pressure leveled out at 1013 millibars at 0600 hours. Cloud cover remains stationary at roughly 4,000 feet.",
        "options": ["POSITIVE", "NEGATIVE", "NEUTRAL"],
        "correct_answer": "NEUTRAL",
        "tokens_salient": ["leveled out", "1013 millibars", "stationary", "cloud cover"],
        "explanation": "Objective scientific telemetry without emotional polarization or affective bias."
    },
    {
        "id": "nlp_sent_4",
        "category": "sentiment",
        "difficulty": "hard",
        "title": "Bitter-Sweet Discovery",
        "text": "We buried Captain Vance beneath the ironwood pines at dawn. Yet, clenched in his frozen fist was the unbroken marine compass we thought was lost forever in the deep reef.",
        "options": ["POSITIVE", "NEGATIVE", "NEUTRAL"],
        "correct_answer": "POSITIVE",
        "tokens_salient": ["unbroken marine compass", "lost forever", "buried Captain"],
        "explanation": "Complex mixed valence: despite grief, the pivotal breakthrough of securing the salvation compass shifts net strategic sentiment to positive survival hope."
    },

    # --- EMOTION SAMPLES ---
    {
        "id": "nlp_emo_1",
        "category": "emotion",
        "difficulty": "easy",
        "title": "Intercepted Night Shouts",
        "text": "Something massive is thrashing through the bamboo grove right outside our shelter tent! Its claws are tearing through the tarp, someone help us!",
        "options": ["FEAR", "JOY", "ANGER", "SADNESS", "SURPRISE"],
        "correct_answer": "FEAR",
        "tokens_salient": ["massive thrashing", "claws tearing", "someone help us"],
        "explanation": "High visceral panic, immediate existential threat, and urgent cry for help characterize Fear."
    },
    {
        "id": "nlp_emo_2",
        "category": "emotion",
        "difficulty": "easy",
        "title": "Radio Operator's Fury",
        "text": "They promised supply drops three days ago! Those lying cowards abandoned us here to rot while they saved their own skin!",
        "options": ["ANGER", "JOY", "FEAR", "SADNESS", "SURPRISE"],
        "correct_answer": "ANGER",
        "tokens_salient": ["lying cowards", "abandoned us", "saved their own skin", "rot"],
        "explanation": "Blame attribution, accusations of betrayal ('lying cowards'), and explosive hostility indicate Anger."
    },
    {
        "id": "nlp_emo_3",
        "category": "emotion",
        "difficulty": "medium",
        "title": "The Last Sunken Photo",
        "text": "Found my daughter's waterproof photo case washed up on the sandbar. The glass is cracked... just like everything else we left behind.",
        "options": ["SADNESS", "ANGER", "FEAR", "JOY", "SURPRISE"],
        "correct_answer": "SADNESS",
        "tokens_salient": ["left behind", "cracked", "daughter's photo", "washed up"],
        "explanation": "Melancholic reflection on irrevocable loss and personal despair indicates Sadness."
    },
    {
        "id": "nlp_emo_4",
        "category": "emotion",
        "difficulty": "hard",
        "title": "Ancient Cavern Inscription",
        "text": "I scraped away centuries of phosphorescent moss from the granite wall... and uncovered English initials carved in 1842. How could anyone have been here before the archipelago was mapped?!",
        "options": ["SURPRISE", "FEAR", "ANGER", "JOY", "SADNESS"],
        "correct_answer": "SURPRISE",
        "tokens_salient": ["How could anyone", "uncovered", "before mapped"],
        "explanation": "Sudden cognitive dissonance contradicting prior world knowledge triggers profound Surprise / Awe."
    },

    # --- INTENT CLASSIFICATION SAMPLES ---
    {
        "id": "nlp_intent_1",
        "category": "intent",
        "difficulty": "easy",
        "title": "Static Burst on 121.5 MHz",
        "text": "MAYDAY MAYDAY, vessel Horizon taking on water rapidly at coordinates 14-North 71-West! Bilge pumps failed, requesting urgent air-sea rescue!",
        "options": ["SOS Distress", "Trade Offer", "Hazard Warning", "Navigation Query"],
        "correct_answer": "SOS Distress",
        "tokens_salient": ["MAYDAY MAYDAY", "taking on water", "urgent rescue"],
        "explanation": "Unambiguous standard emergency distress declaration requesting immediate rescue intervention."
    },
    {
        "id": "nlp_intent_2",
        "category": "intent",
        "difficulty": "medium",
        "title": "Camp Barter Broadcast",
        "text": "Survivor team Delta to any nearby encampment: we have 15 liters of distilled fuel and surplus dry rations. Willing to exchange for medical antiseptics or spark plugs.",
        "options": ["Trade Offer", "SOS Distress", "Hazard Warning", "Navigation Query"],
        "correct_answer": "Trade Offer",
        "tokens_salient": ["willing to exchange", "surplus dry rations", "distilled fuel"],
        "explanation": "Commercial barter proposal specifying available surplus goods and desired commodities."
    },
    {
        "id": "nlp_intent_3",
        "category": "intent",
        "difficulty": "medium",
        "title": "Coastal Telegraph",
        "text": "Do NOT attempt crossing the southern strait during high tide! Rogue rip currents and jagged submerged reefs will capsize any hull under 30 feet.",
        "options": ["Hazard Warning", "SOS Distress", "Trade Offer", "Navigation Query"],
        "correct_answer": "Hazard Warning",
        "tokens_salient": ["Do NOT attempt", "rogue rip currents", "capsize any hull"],
        "explanation": "Advisory warning preventing other mariners from entering dangerous nautical conditions."
    },

    # --- SARCASM / IRONY SAMPLES ---
    {
        "id": "nlp_sarcasm_1",
        "category": "sarcasm",
        "difficulty": "easy",
        "title": "Bottle Note #14",
        "text": "Oh fantastic, another tropical monsoon right after we dried our only blankets. Truly the five-star luxury island vacation I was dreaming of.",
        "options": ["SARCASTIC", "SINCERE"],
        "correct_answer": "SARCASTIC",
        "tokens_salient": ["Oh fantastic", "five-star luxury", "dreaming of"],
        "explanation": "Heavy ironic contrast between devastating reality (soaked blankets) and mock praise ('five-star luxury')."
    },
    {
        "id": "nlp_sarcasm_2",
        "category": "sarcasm",
        "difficulty": "medium",
        "title": "Bottle Note #29",
        "text": "The radio transmitter only sparks when you kick it, but yesterday it picked up an automated weather beacon for six straight seconds. Progress!",
        "options": ["SARCASTIC", "SINCERE"],
        "correct_answer": "SARCASTIC",
        "tokens_salient": ["only sparks when you kick it", "six straight seconds", "Progress!"],
        "explanation": "Mock triumph celebrated over absurdly minimal and dysfunctional equipment behavior."
    },
    {
        "id": "nlp_sarcasm_3",
        "category": "sarcasm",
        "difficulty": "hard",
        "title": "Bottle Note #33",
        "text": "We followed the old marine chart exactly as specified, navigated through the shallow reef gap at sunset, and arrived safely at the eastern shelter lagoon without a scratch.",
        "options": ["SARCASTIC", "SINCERE"],
        "correct_answer": "SINCERE",
        "tokens_salient": ["arrived safely", "without a scratch", "followed exactly"],
        "explanation": "Factual description of a successful navigational maneuver without hyperbole or irony."
    }
]

def get_nlp_challenges_by_difficulty(difficulty: str) -> List[Dict[str, Any]]:
    return [c for c in NLP_CHALLENGES if c["difficulty"] == difficulty]

