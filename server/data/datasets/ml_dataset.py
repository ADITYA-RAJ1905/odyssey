"""
Curated Samples for Island 1: THE PREDICTOR
Provides diverse samples across Difficulty tiers (Easy, Medium, Hard)
- Credit Repayment Classification
- House Valuation Regression
- Transaction Anomaly Detection
"""

from typing import Dict, Any, List

ML_LOAN_SAMPLES: List[Dict[str, Any]] = [
    # EASY (Clear cases)
    {
        "id": "loan_easy_1",
        "difficulty": "easy",
        "story": "A senior civil engineer with 14 years tenure at the regional waterworks requests a bridge loan.",
        "display_features": {
            "Monthly Income": "$8,400",
            "Debt-to-Income": "16%",
            "Credit Score": "790 (Excellent)",
            "Loan Amount": "$12,000",
            "Employment History": "14.2 Years"
        },
        "features": [8400, 16, 790, 12000, 14.2],
        "actual_repaid": "YES",
        "explanation": "High stable income, pristine 790 credit rating, and low debt obligations clearly mitigate repayment risk."
    },
    {
        "id": "loan_easy_2",
        "difficulty": "easy",
        "story": "An applicant with recent bankruptcy filings, multiple maxed credit lines, and 2 months at their current retail job.",
        "display_features": {
            "Monthly Income": "$1,900",
            "Debt-to-Income": "64%",
            "Credit Score": "495 (Very Poor)",
            "Loan Amount": "$28,000",
            "Employment History": "0.2 Years"
        },
        "features": [1900, 64, 495, 28000, 0.2],
        "actual_repaid": "NO",
        "explanation": "Severe debt-to-income ratio (64%) combined with a 495 credit score and loan exceeding annual salary indicates near-certain default."
    },
    # MEDIUM (Borderline cases)
    {
        "id": "loan_med_1",
        "difficulty": "medium",
        "story": "A freelance digital designer with fluctuating seasonal income but substantial savings and a respectable credit score.",
        "display_features": {
            "Monthly Income": "$4,600",
            "Debt-to-Income": "38%",
            "Credit Score": "685 (Good)",
            "Loan Amount": "$16,500",
            "Employment History": "3.5 Years"
        },
        "features": [4600, 38, 685, 16500, 3.5],
        "actual_repaid": "YES",
        "explanation": "While debt-to-income is moderate (38%), the 685 credit score and 3.5 years of steady freelance billings crossed the approval threshold."
    },
    {
        "id": "loan_med_2",
        "difficulty": "medium",
        "story": "A mid-level technician with fair credit asking for an auto loan equal to 7 months of gross wages.",
        "display_features": {
            "Monthly Income": "$3,800",
            "Debt-to-Income": "44%",
            "Credit Score": "620 (Fair)",
            "Loan Amount": "$24,000",
            "Employment History": "2.1 Years"
        },
        "features": [3800, 44, 620, 24000, 2.1],
        "actual_repaid": "NO",
        "explanation": "The 44% debt-to-income burden combined with sub-650 credit score tips the model's random forest classifier into elevated default risk."
    },
    # HARD (Deceptive cases)
    {
        "id": "loan_hard_1",
        "difficulty": "hard",
        "story": "An executive with impressive gross income who has accumulated excessive revolving debt and recent credit inquiries.",
        "display_features": {
            "Monthly Income": "$11,200",
            "Debt-to-Income": "52%",
            "Credit Score": "645 (Fair)",
            "Loan Amount": "$48,000",
            "Employment History": "1.4 Years"
        },
        "features": [11200, 52, 645, 48000, 1.4],
        "actual_repaid": "NO",
        "explanation": "High income masks acute cash-flow strain: 52% debt load on a high baseline combined with short tenure creates an overleveraged default trap."
    },
    {
        "id": "loan_hard_2",
        "difficulty": "hard",
        "story": "A young medical resident with low current salary, high student debt, but flawless repayment history and rapid career trajectory.",
        "display_features": {
            "Monthly Income": "$4,200",
            "Debt-to-Income": "41%",
            "Credit Score": "730 (Very Good)",
            "Loan Amount": "$10,000",
            "Employment History": "1.0 Year"
        },
        "features": [4200, 41, 730, 10000, 1.0],
        "actual_repaid": "YES",
        "explanation": "Despite low starting tenure, prime 730 credit and modest loan-to-income ratio yielded a 78% repayment probability."
    }
]

ML_HOUSE_SAMPLES: List[Dict[str, Any]] = [
    {
        "id": "house_1",
        "difficulty": "easy",
        "title": "Seaside Haven Bungalow",
        "display_features": {
            "Living Area": "1,450 sqft",
            "Bedrooms": "2",
            "Bathrooms": "1.5",
            "Location Rating": "8.8 / 10 (Harbor District)",
            "Property Age": "6 Years (Modern Build)"
        },
        "features": [1450, 2, 1.5, 8.8, 6],
        "actual_price": 435000,
        "acceptable_range": [395000, 475000]
    },
    {
        "id": "house_2",
        "difficulty": "medium",
        "title": "Hilltop Stone Manor",
        "display_features": {
            "Living Area": "3,200 sqft",
            "Bedrooms": "4",
            "Bathrooms": "3.5",
            "Location Rating": "7.2 / 10 (Ridgeline Vista)",
            "Property Age": "24 Years"
        },
        "features": [3200, 4, 3.5, 7.2, 24],
        "actual_price": 780000,
        "acceptable_range": [710000, 850000]
    },
    {
        "id": "house_3",
        "difficulty": "hard",
        "title": "Historic Lighthouse Villa",
        "display_features": {
            "Living Area": "4,400 sqft",
            "Bedrooms": "5",
            "Bathrooms": "4.5",
            "Location Rating": "9.5 / 10 (Beacon Point)",
            "Property Age": "55 Years (Fully Restored)"
        },
        "features": [4400, 5, 4.5, 9.5, 55],
        "actual_price": 1180000,
        "acceptable_range": [1060000, 1300000]
    }
]

ML_ANOMALY_SAMPLES: List[Dict[str, Any]] = [
    {
        "id": "trans_1",
        "difficulty": "easy",
        "story": "Analyze the merchant ledger for an account originating in Seattle, WA. One transaction triggers the isolation forest.",
        "transactions": [
            {"id": "tx_1", "merchant": "Corner Grocery Co.", "amount": "$42.50", "time": "12:15 PM", "location": "Seattle, WA", "features": [42.5, 12, 2.1, 1]},
            {"id": "tx_2", "merchant": "Metro Transit Pass", "amount": "$6.00", "time": "08:45 AM", "location": "Seattle, WA", "features": [6.0, 8, 1.5, 1]},
            {"id": "tx_3", "merchant": "Luxury Watch Vault", "amount": "$4,850.00", "time": "03:12 AM", "location": "Bucharest, Romania", "features": [4850.0, 3, 5800.0, 18]},
            {"id": "tx_4", "merchant": "Local Bakery & Cafe", "amount": "$14.20", "time": "09:30 AM", "location": "Seattle, WA", "features": [14.2, 9, 3.2, 1]},
        ],
        "correct_anomaly_index": 2,
        "suspicious_id": "tx_3",
        "explanation": "Transaction #3 ($4,850 at 3:12 AM in Bucharest) represents an extreme anomaly in amount, time, and 5,800-mile geographic displacement."
    },
    {
        "id": "trans_2",
        "difficulty": "medium",
        "story": "A corporate travel card ledger with frequent domestic charges. Identify the anomalous activity.",
        "transactions": [
            {"id": "tx_1", "merchant": "Airport Express Fuel", "amount": "$55.00", "time": "06:20 AM", "location": "Denver, CO", "features": [55.0, 6, 8.0, 1]},
            {"id": "tx_2", "merchant": "Cloud Compute Nodes Inc.", "amount": "$3,200.00", "time": "02:40 AM", "location": "Remote Web API", "features": [3200.0, 2, 1200.0, 14]},
            {"id": "tx_3", "merchant": "Bistro Terminal 2", "amount": "$28.40", "time": "07:15 AM", "location": "Denver, CO", "features": [28.4, 7, 8.5, 1]},
            {"id": "tx_4", "merchant": "Hotel Downtown", "amount": "$189.00", "time": "08:00 PM", "location": "Denver, CO", "features": [189.0, 20, 3.0, 2]},
        ],
        "correct_anomaly_index": 1,
        "suspicious_id": "tx_2",
        "explanation": "Transaction #2 exhibits high velocity (14 tx/hr) at 2:40 AM with an anomalous spike in capital outflow ($3,200)."
    }
]

# Backward-compat aliases
LOAN_SAMPLES = ML_LOAN_SAMPLES
HOUSE_SAMPLES = ML_HOUSE_SAMPLES
TRANSACTION_SAMPLES = ML_ANOMALY_SAMPLES

