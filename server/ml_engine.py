import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List

# Feature indices:
# 0: avg_reaction_time (0.5 to 5.0 seconds)
# 1: mistake_rate (0.0 to 1.0)
# 2: risk_score (0.0 to 1.0)
# 3: search_optimality (0.0 to 1.0)
# 4: combat_tactical_ratio (0.0 to 1.0)
# 5: opt_efficiency (0.0 to 1.0)
# 6: resource_thrift (0.0 to 1.0)
# 7: exploration_depth (0.0 to 1.0)

ARCHETYPES = [
    "Tactical Strategist",
    "Speedrunner",
    "Cautious Scholar",
    "Reckless Pioneer"
]

class OdysseyMLEngine:
    def __init__(self):
        self.scaler = StandardScaler()
        self.rf_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.lr_classifier = LogisticRegression(max_iter=500, random_state=42)
        self.kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        self.pca = PCA(n_components=2, random_state=42)
        self._init_and_train_models()

    def _generate_synthetic_corpus(self, n_samples_per_class=150):
        np.random.seed(42)
        X_list = []
        y_list = []

        # 0: Tactical Strategist: moderate speed, very low mistakes, low risk, high search optimality, high combat tactical, high opt, high thrift, high exploration
        for _ in range(n_samples_per_class):
            feat = [
                np.clip(np.random.normal(2.5, 0.4), 1.0, 4.5), # reaction time
                np.clip(np.random.normal(0.12, 0.05), 0.0, 0.4), # mistakes
                np.clip(np.random.normal(0.25, 0.08), 0.0, 0.5), # risk
                np.clip(np.random.normal(0.88, 0.06), 0.6, 1.0), # search opt
                np.clip(np.random.normal(0.85, 0.07), 0.5, 1.0), # combat
                np.clip(np.random.normal(0.80, 0.08), 0.4, 1.0), # opt
                np.clip(np.random.normal(0.78, 0.09), 0.4, 1.0), # thrift
                np.clip(np.random.normal(0.75, 0.08), 0.4, 1.0), # exploration
            ]
            X_list.append(feat)
            y_list.append(0)

        # 1: Speedrunner: very fast reaction, moderate mistakes, high risk, moderate search opt, aggressive combat, fast opt, low thrift, moderate exploration
        for _ in range(n_samples_per_class):
            feat = [
                np.clip(np.random.normal(0.8, 0.2), 0.3, 1.5),
                np.clip(np.random.normal(0.35, 0.10), 0.1, 0.7),
                np.clip(np.random.normal(0.85, 0.08), 0.5, 1.0),
                np.clip(np.random.normal(0.70, 0.10), 0.3, 0.95),
                np.clip(np.random.normal(0.55, 0.12), 0.2, 0.85),
                np.clip(np.random.normal(0.75, 0.10), 0.3, 0.95),
                np.clip(np.random.normal(0.35, 0.10), 0.1, 0.6),
                np.clip(np.random.normal(0.50, 0.12), 0.2, 0.8),
            ]
            X_list.append(feat)
            y_list.append(1)

        # 2: Cautious Scholar: deliberate reaction, very low mistakes, very low risk, high search opt, defensive combat, high thrift, very high exploration
        for _ in range(n_samples_per_class):
            feat = [
                np.clip(np.random.normal(3.8, 0.5), 2.0, 5.0),
                np.clip(np.random.normal(0.08, 0.04), 0.0, 0.25),
                np.clip(np.random.normal(0.15, 0.06), 0.0, 0.35),
                np.clip(np.random.normal(0.92, 0.05), 0.7, 1.0),
                np.clip(np.random.normal(0.75, 0.08), 0.4, 0.95),
                np.clip(np.random.normal(0.70, 0.09), 0.3, 0.95),
                np.clip(np.random.normal(0.90, 0.06), 0.6, 1.0),
                np.clip(np.random.normal(0.92, 0.05), 0.7, 1.0),
            ]
            X_list.append(feat)
            y_list.append(2)

        # 3: Reckless Pioneer: fast reaction, high mistakes, very high risk, low-med search opt, chaotic combat, high exploration, low thrift
        for _ in range(n_samples_per_class):
            feat = [
                np.clip(np.random.normal(1.2, 0.3), 0.5, 2.2),
                np.clip(np.random.normal(0.50, 0.12), 0.2, 0.9),
                np.clip(np.random.normal(0.92, 0.06), 0.7, 1.0),
                np.clip(np.random.normal(0.50, 0.14), 0.1, 0.8),
                np.clip(np.random.normal(0.40, 0.15), 0.1, 0.75),
                np.clip(np.random.normal(0.55, 0.14), 0.2, 0.85),
                np.clip(np.random.normal(0.25, 0.10), 0.0, 0.5),
                np.clip(np.random.normal(0.85, 0.08), 0.5, 1.0),
            ]
            X_list.append(feat)
            y_list.append(3)

        return np.array(X_list), np.array(y_list)

    def _init_and_train_models(self):
        X, y = self._generate_synthetic_corpus()
        self.X_corpus = X
        self.y_corpus = y
        self.scaler.fit(X)
        X_scaled = self.scaler.transform(X)

        self.rf_classifier.fit(X_scaled, y)
        self.lr_classifier.fit(X_scaled, y)
        self.kmeans.fit(X_scaled)
        self.pca.fit(X_scaled)

        # Precompute PCA projection of sample points for the visual cluster scatter plot
        self.corpus_pca = self.pca.transform(X_scaled)

    def predict_profile(self, telemetry: Dict[str, Any]) -> Dict[str, Any]:
        # Extract features with safe fallbacks
        rt = float(telemetry.get("reaction_time", 2.2))
        mr = float(telemetry.get("mistake_rate", 0.2))
        rk = float(telemetry.get("risk_score", 0.4))
        so = float(telemetry.get("search_optimality", 0.75))
        ct = float(telemetry.get("combat_tactical_ratio", 0.65))
        oe = float(telemetry.get("opt_efficiency", 0.60))
        th = float(telemetry.get("resource_thrift", 0.70))
        ex = float(telemetry.get("exploration_depth", 0.65))

        x_raw = np.array([[rt, mr, rk, so, ct, oe, th, ex]])
        x_scaled = self.scaler.transform(x_raw)

        # Random Forest inference
        rf_probs = self.rf_classifier.predict_proba(x_scaled)[0]
        archetype_idx = int(np.argmax(rf_probs))
        archetype_name = ARCHETYPES[archetype_idx]
        confidence = float(rf_probs[archetype_idx])

        # Logistic Regression comparison
        lr_probs = self.lr_classifier.predict_proba(x_scaled)[0]
        lr_archetype = ARCHETYPES[int(np.argmax(lr_probs))]

        # K-Means clustering
        cluster_id = int(self.kmeans.predict(x_scaled)[0])
        cluster_distances = np.linalg.norm(self.kmeans.cluster_centers_ - x_scaled, axis=1).tolist()

        # PCA 2D coordinates for visual cluster plot
        pca_coords = self.pca.transform(x_scaled)[0].tolist()

        # Dynamic skill calculations (grounded in comparative percentiles against corpus)
        # Search skill: derived from search optimality & mistake penalization
        search_score = int(np.clip((so * 0.7 + (1.0 - mr) * 0.3) * 100, 15, 99))
        # Combat skill: derived from tactical ratio & reaction speed bonus
        speed_factor = np.clip(3.0 / max(rt, 0.5), 0.4, 1.2)
        combat_score = int(np.clip((ct * 0.6 + speed_factor * 0.2 + (1.0 - mr) * 0.2) * 100, 15, 99))
        # Optimization skill: derived from opt_efficiency & resource thrift
        optimize_score = int(np.clip((oe * 0.6 + th * 0.4) * 100, 15, 99))
        # Learning skill: derived from exploration depth & adaptive recovery (1 - mr)
        learning_score = int(np.clip((ex * 0.5 + (1.0 - mr) * 0.5) * 100, 15, 99))
        # Planning skill
        planning_score = int(np.clip((so * 0.5 + th * 0.3 + (1.0 - rk * 0.5) * 0.2) * 100, 15, 99))

        risk_label = "Low" if rk < 0.35 else ("High" if rk > 0.65 else "Moderate")
        explor_label = "High" if ex > 0.65 else ("Low" if ex < 0.35 else "Balanced")
        efficiency_label = "High" if oe > 0.65 else ("Low" if oe < 0.4 else "Moderate")

        # Select a representative subsample of corpus points (20 per class) to send to UI for plotting
        sample_points = []
        for i in range(0, len(self.X_corpus), 8):
            sample_points.append({
                "x": round(float(self.corpus_pca[i][0]), 3),
                "y": round(float(self.corpus_pca[i][1]), 3),
                "archetype": ARCHETYPES[int(self.y_corpus[i])],
                "cluster": int(self.y_corpus[i])
            })

        return {
            "archetype": archetype_name,
            "confidence": round(confidence, 3),
            "probabilities": {ARCHETYPES[i]: round(float(rf_probs[i]), 3) for i in range(4)},
            "logistic_regression_pred": lr_archetype,
            "cluster_id": cluster_id,
            "cluster_distances": [round(d, 3) for d in cluster_distances],
            "pca_position": {"x": round(pca_coords[0], 3), "y": round(pca_coords[1], 3)},
            "skills": {
                "SEARCH": search_score,
                "COMBAT": combat_score,
                "OPTIMIZE": optimize_score,
                "LEARNING": learning_score,
                "PLANNING": planning_score
            },
            "behavior": {
                "archetype": archetype_name,
                "risk_taking": risk_label,
                "exploration": explor_label,
                "efficiency": efficiency_label,
                "reaction_time_s": round(rt, 2)
            },
            "cluster_scatter_sample": sample_points
        }

    def evaluate_oracle_scan(self, dilemmas: Dict[str, str], creed: str = "", reaction_times: List[float] = None) -> Dict[str, Any]:
        # Score traits based on dilemmas
        altruism = 50
        audacity = 50
        cunning = 50
        rationality = 50

        d1 = dilemmas.get("distress_beacon", "altruist")
        if d1 == "altruist": altruism += 30; audacity += 15
        elif d1 == "salvage_first": cunning += 35; rationality += 10
        elif d1 == "bypass_safe": rationality += 30; altruism -= 10

        d2 = dilemmas.get("hold_breach", "survivor")
        if d2 == "jettison_gold": rationality += 35; audacity -= 10
        elif d2 == "patch_underwater": audacity += 40; altruism += 15
        elif d2 == "pump_slow": rationality += 20; cunning += 20

        d3 = dilemmas.get("automaton_trade", "diplomat")
        if d3 == "share_charts": altruism += 25; rationality += 20
        elif d3 == "deceive_fake": cunning += 45; altruism -= 20
        elif d3 == "refuse_leave": rationality += 25; audacity -= 10

        d4 = dilemmas.get("sunken_gate", "explorer")
        if d4 == "dive_headfirst": audacity += 45; rationality -= 15
        elif d4 == "probe_sensors": rationality += 40; cunning += 15
        elif d4 == "seal_gate": rationality += 30; audacity -= 25

        # Factor in text creed sentiment if provided
        creed_lower = creed.lower()
        if any(w in creed_lower for w in ["honor", "save", "help", "together", "protect", "light"]):
            altruism += 15
        if any(w in creed_lower for w in ["storm", "dare", "glory", "conquer", "brave", "risk"]):
            audacity += 20
        if any(w in creed_lower for w in ["calculate", "study", "learn", "plan", "truth", "stars"]):
            rationality += 20
        if any(w in creed_lower for w in ["win", "survive", "gold", "cunning", "shadow", "trick"]):
            cunning += 20

        # Normalization
        altruism = int(np.clip(altruism, 15, 99))
        audacity = int(np.clip(audacity, 15, 99))
        cunning = int(np.clip(cunning, 15, 99))
        rationality = int(np.clip(rationality, 15, 99))

        # Determine Oracle Tarot Archetype
        if audacity >= 70 and altruism >= 60:
            tarot = "The Storm Pioneer"
            element = "Tempest Gale"
            title = "Breaker of Uncharted Reefs"
            prediction = "In action RPGs and roguelikes, you rush straight into boss rooms with high DPS and rely on lightning reflexes rather than defensive potions."
        elif rationality >= 70 and cunning >= 55:
            tarot = "The Grand Architect"
            element = "Astral Clockwork"
            title = "Master of Unseen Variables"
            prediction = "In strategy and tactical games, you build hyper-optimized resource economies and anticipate enemy traps three turns in advance."
        elif cunning >= 70:
            tarot = "The Phantom Corsair"
            element = "Abyssal Shadow"
            title = "Weaver of Deceptive Currents"
            prediction = "In multiplayer games, you excel at stealth, misdirection, and feints, tricking opponents into overextending before counter-attacking."
        else:
            tarot = "The Astral Cartographer"
            element = "Solar Radiance"
            title = "Keeper of the Meridian Compass"
            prediction = "In open-world games, you explore 100% of the map before touching the main quest and never leave a fallen teammate behind."

        avg_rt = float(np.mean(reaction_times)) if reaction_times and len(reaction_times) > 0 else 1.8

        # Run synthetic ML inference with these computed traits
        telemetry = {
            "reaction_time": avg_rt,
            "mistake_rate": round(max(0.05, (100 - rationality) / 300), 2),
            "risk_score": round(audacity / 100, 2),
            "search_optimality": round(rationality / 100, 2),
            "combat_tactical_ratio": round((audacity + cunning) / 200, 2),
            "opt_efficiency": round(rationality / 100, 2),
            "resource_thrift": round((100 - audacity * 0.5) / 100, 2),
            "exploration_depth": round(max(altruism, audacity) / 100, 2)
        }
        profile = self.predict_profile(telemetry)

        return {
            "tarot_archetype": tarot,
            "elemental_alignment": element,
            "title": title,
            "gamer_prediction": prediction,
            "traits": {
                "Audacity": audacity,
                "Rationality": rationality,
                "Altruism": altruism,
                "Cunning": cunning
            },
            "profile_match": profile
        }

ml_engine = OdysseyMLEngine()


