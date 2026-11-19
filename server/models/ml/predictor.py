"""
ML Models for Island 1: THE PREDICTOR
- Loan Repayment Classification (RandomForest / LogisticRegression)
- Real Estate Valuation Regression (GradientBoosting / Ridge)
- Fraudulent Transaction Anomaly Detection (IsolationForest)
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List

class MLPredictor:
    def __init__(self):
        self._init_classification_model()
        self._init_regression_model()
        self._init_anomaly_model()

    def _init_classification_model(self):
        """Train baseline loan creditworthiness model on synthetic credit dataset matching real-world distributions."""
        np.random.seed(42)
        # Features: [Monthly Income ($), Debt-to-Income Ratio (%), Credit Score (300-850), Loan Amount ($), Employment Years]
        # Generate 1500 realistic loan applications
        incomes = np.random.normal(5500, 2200, 1500).clip(1200, 25000)
        dtis = np.random.normal(32, 12, 1500).clip(5, 75)
        credit_scores = np.random.normal(670, 85, 1500).clip(450, 850)
        loan_amounts = np.random.normal(18000, 9000, 1500).clip(2000, 75000)
        emp_years = np.random.exponential(4.5, 1500).clip(0, 35)

        X = np.column_stack([incomes, dtis, credit_scores, loan_amounts, emp_years])

        # Credit logic: higher score, higher income, lower dti -> repay (1)
        z = (
            0.0004 * incomes
            - 0.045 * dtis
            + 0.012 * (credit_scores - 600)
            - 0.00008 * loan_amounts
            + 0.12 * emp_years
            - 0.5
        )
        probs = 1 / (1 + np.exp(-z))
        y = (probs > 0.5).astype(int)

        self.loan_scaler = StandardScaler()
        X_scaled = self.loan_scaler.fit_transform(X)

        self.loan_clf = RandomForestClassifier(n_estimators=60, max_depth=6, random_state=42)
        self.loan_clf.fit(X_scaled, y)

    def _init_regression_model(self):
        """Train house price prediction model on realistic real-estate features."""
        np.random.seed(101)
        # Features: [Living Area (sqft), Bedrooms, Bathrooms, Location Rating (1-10), Property Age (years)]
        area = np.random.normal(2100, 650, 1200).clip(600, 5500)
        beds = np.random.choice([1, 2, 3, 4, 5], size=1200, p=[0.1, 0.25, 0.4, 0.2, 0.05])
        baths = (beds * 0.75 + np.random.normal(0, 0.35, 1200)).clip(1, 5)
        loc_rating = np.random.uniform(2, 9.8, 1200)
        age = np.random.exponential(18, 1200).clip(0, 90)

        X_house = np.column_stack([area, beds, baths, loc_rating, age])
        price = (
            75000
            + 185 * area
            + 18000 * beds
            + 24000 * baths
            + 32000 * loc_rating
            - 1400 * age
            + np.random.normal(0, 22000, 1200)
        ).clip(85000, 1600000)

        self.house_scaler = StandardScaler()
        X_house_scaled = self.house_scaler.fit_transform(X_house)

        self.house_reg = GradientBoostingRegressor(n_estimators=75, max_depth=4, random_state=42)
        self.house_reg.fit(X_house_scaled, price)

    def _init_anomaly_model(self):
        """Isolation Forest for financial transaction anomaly detection."""
        np.random.seed(202)
        # Features: [Amount ($), Hour of Day (0-23), Distance from Home (miles), Velocity (tx in last hour)]
        regular_amount = np.random.exponential(45, 1000).clip(2, 400)
        regular_hour = np.random.normal(14, 4, 1000).clip(0, 23)
        regular_dist = np.random.exponential(6, 1000).clip(0.1, 45)
        regular_vel = np.random.poisson(1.4, 1000).clip(0, 6)
        X_reg = np.column_stack([regular_amount, regular_hour, regular_dist, regular_vel])

        # A few anomalous outliers
        anom_amount = np.random.uniform(1800, 9500, 50)
        anom_hour = np.random.choice([2, 3, 4], 50)
        anom_dist = np.random.uniform(450, 4200, 50)
        anom_vel = np.random.uniform(12, 35, 50)
        X_anom = np.column_stack([anom_amount, anom_hour, anom_dist, anom_vel])

        X_all = np.vstack([X_reg, X_anom])
        self.iso_scaler = StandardScaler()
        X_scaled = self.iso_scaler.fit_transform(X_all)

        self.iso_forest = IsolationForest(contamination=0.05, random_state=42)
        self.iso_forest.fit(X_scaled)

    def predict_loan_repayment(self, features: List[float]) -> Dict[str, Any]:
        """Predict whether applicant will repay loan (1=Yes, 0=No)."""
        X = np.array(features).reshape(1, -1)
        X_scaled = self.loan_scaler.transform(X)
        pred = int(self.loan_clf.predict(X_scaled)[0])
        probs = self.loan_clf.predict_proba(X_scaled)[0]
        confidence = float(probs[pred])

        return {
            "prediction": "YES" if pred == 1 else "NO",
            "prediction_code": pred,
            "confidence": round(confidence, 3),
            "repay_probability": round(float(probs[1]), 3),
            "default_probability": round(float(probs[0]), 3)
        }

    def predict_house_price(self, features: List[float]) -> Dict[str, Any]:
        """Predict valuation for house features."""
        X = np.array(features).reshape(1, -1)
        X_scaled = self.house_scaler.transform(X)
        pred_price = float(self.house_reg.predict(X_scaled)[0])

        return {
            "predicted_price": round(pred_price, -2),
            "confidence_range": [round(pred_price * 0.93, -2), round(pred_price * 1.07, -2)]
        }

    def detect_anomalies(self, transactions: List[List[float]]) -> Dict[str, Any]:
        """Classify transactions and identify the outlier."""
        X = np.array(transactions)
        X_scaled = self.iso_scaler.transform(X)
        preds = self.iso_forest.predict(X_scaled) # 1 = normal, -1 = anomaly
        scores = self.iso_forest.decision_function(X_scaled)

        anomaly_indices = [i for i, p in enumerate(preds) if p == -1]
        most_anomalous_idx = int(np.argmin(scores))

        return {
            "anomaly_indices": anomaly_indices,
            "most_suspicious_index": most_anomalous_idx,
            "anomaly_scores": [round(float(s), 3) for s in scores]
        }

ml_predictor = MLPredictor()

