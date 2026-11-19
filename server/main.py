import os
import sys
from pathlib import Path

server_dir = Path(__file__).resolve().parent
root_dir = server_dir.parent
if str(server_dir) not in sys.path:
    sys.path.insert(0, str(server_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import (
    init_db, save_game_state, load_game_state, log_telemetry,
    log_research_metric, get_research_data
)
from ml_engine import ml_engine
from dl_engine import dl_engine, dl_rune_caster
from rl_engine import rl_engine
from rag_engine import rag_engine
from minimax_engine import minimax_guardian
from genetic_engine import genetic_engine
from adaptation_engine import adaptation_engine

from server.routes.game import router as game_router
from server.routes.ml import router as ml_island_router
from server.routes.dl import router as dl_island_router
from server.routes.cv import router as cv_island_router
from server.routes.nlp import router as nlp_island_router
from server.routes.rl import router as rl_island_router
from server.routes.rag import router as rag_island_router

app = FastAPI(title="AI Odyssey Core Intelligence Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Odyssey Game & Island Routers
app.include_router(game_router)
app.include_router(ml_island_router)
app.include_router(dl_island_router)
app.include_router(cv_island_router)
app.include_router(nlp_island_router)
app.include_router(rl_island_router)
app.include_router(rag_island_router)

@app.on_event("startup")
def on_startup():
    init_db()

# --- Health Check ---
@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "engines": {
            "ml": "scikit-learn (RandomForest, KMeans, PCA)",
            "dl": "PyTorch (MLP, Autograd, CNN, FGSM, Overfitting)",
            "rl": "Q-Learning Gridworld",
            "rag": "FAISS IndexFlatIP + Recursive Chunker",
            "minimax": "Alpha-Beta Pruned Adversarial Engine",
            "evolution": "Multi-Objective Genetic Algorithm",
            "adaptation": "Bayesian / ZPD Adaptive Engine"
        }
    }

# --- Game State Persistence ---
class SaveStateRequest(BaseModel):
    state: Dict[str, Any]

@app.post("/api/state/{session_id}")
def api_save_state(session_id: str, payload: SaveStateRequest):
    save_game_state(session_id, payload.state)
    return {"status": "saved", "session_id": session_id}

@app.get("/api/state/{session_id}")
def api_load_state(session_id: str):
    state = load_game_state(session_id)
    if not state:
        return {"found": False, "state": None}
    return {"found": True, "state": state}

# --- Telemetry & Research Logging ---
class TelemetryRequest(BaseModel):
    session_id: str
    event_type: str
    payload: Dict[str, Any]

@app.post("/api/telemetry")
def api_log_telemetry(req: TelemetryRequest):
    log_telemetry(req.session_id, req.event_type, req.payload)
    return {"status": "logged"}

class ResearchLogRequest(BaseModel):
    session_id: str
    island_id: str
    metric_name: str
    metric_value: float
    details: Dict[str, Any]

@app.post("/api/research/log")
def api_log_research(req: ResearchLogRequest):
    log_research_metric(req.session_id, req.island_id, req.metric_name, req.metric_value, req.details)
    return {"status": "recorded"}

@app.get("/api/research/data")
def api_get_research_data():
    return get_research_data()

# --- Island 4: Machine Learning ---
class MLProfileRequest(BaseModel):
    telemetry: Dict[str, Any]

@app.post("/api/ml/profile")
def api_ml_profile(req: MLProfileRequest):
    return ml_engine.predict_profile(req.telemetry)

class MLOracleScanRequest(BaseModel):
    dilemmas: Dict[str, str]
    creed: Optional[str] = ""
    reaction_times: Optional[List[float]] = None

@app.post("/api/ml/oracle-scan")
def api_ml_oracle_scan(req: MLOracleScanRequest):
    return ml_engine.evaluate_oracle_scan(req.dilemmas, req.creed or "", req.reaction_times)

# --- Island 2: Minimax Decision Engine ---
class MinimaxRequest(BaseModel):
    guardian_hp: int
    player_hp: int
    guardian_energy: int
    player_energy: int
    guardian_defending: bool = False
    player_defending: bool = False

@app.post("/api/minimax/decide")
def api_minimax_decide(req: MinimaxRequest):
    return minimax_guardian.decide_move(req.model_dump())

# --- Island 3: Genetic Evolution ---
class EvolutionRunRequest(BaseModel):
    generations: int = 30
    mutation_rate: float = 0.15
    crossover_rate: float = 0.85

@app.post("/api/evolution/run")
def api_evolution_run(req: EvolutionRunRequest):
    return genetic_engine.run_evolution(
        generations=req.generations,
        mutation_rate=req.mutation_rate,
        crossover_rate=req.crossover_rate
    )

class ManualConfigCheckRequest(BaseModel):
    genes: Dict[str, float]

@app.post("/api/evolution/evaluate")
def api_evolution_evaluate(req: ManualConfigCheckRequest):
    return genetic_engine.evaluate_manual_configuration(req.genes)

class EvolutionDerbyRequest(BaseModel):
    generation_mode: str = "gen_1"

@app.post("/api/evolution/derby")
def api_evolution_derby(req: EvolutionDerbyRequest):
    return genetic_engine.simulate_fleet_derby(req.generation_mode)

# --- Island 5: Deep Learning (PyTorch) ---
class DLForwardRequest(BaseModel):
    layer_sizes: List[int] = [2, 8, 8, 2]
    activations: List[str] = ["relu", "relu", "softmax"]
    input_sample: Optional[List[float]] = None

@app.post("/api/dl/forward")
def api_dl_forward(req: DLForwardRequest):
    return dl_engine.forward_pass_simulation(req.layer_sizes, req.activations, req.input_sample)

class DLTrainRequest(BaseModel):
    layer_sizes: List[int] = [2, 16, 8, 2]
    activations: List[str] = ["relu", "relu", "softmax"]
    epochs: int = 30
    lr: float = 0.04
    batch_size: int = 32

@app.post("/api/dl/train")
def api_dl_train(req: DLTrainRequest):
    return dl_engine.train_mlp_dataset(
        layer_sizes=req.layer_sizes,
        activations=req.activations,
        epochs=req.epochs,
        lr=req.lr,
        batch_size=req.batch_size
    )

class DLCNNInspectRequest(BaseModel):
    glyph_idx: int = 0
    custom_matrix: Optional[List[List[float]]] = None

@app.post("/api/dl/cnn-inspect")
def api_dl_cnn_inspect(req: DLCNNInspectRequest):
    return dl_engine.inspect_cnn_glyph(req.glyph_idx, req.custom_matrix)

class DLOverfittingRequest(BaseModel):
    solutions: List[str] = []

@app.post("/api/dl/overfitting-challenge")
def api_dl_overfitting(req: DLOverfittingRequest):
    return dl_engine.run_overfitting_challenge(req.solutions)

class DLAdversarialRequest(BaseModel):
    glyph_idx: int = 0
    epsilon: float = 0.25

@app.post("/api/dl/adversarial-fgsm")
def api_dl_adversarial(req: DLAdversarialRequest):
    return dl_engine.generate_adversarial_example(req.glyph_idx, req.epsilon)

class DLClassifyDrawingRequest(BaseModel):
    drawing_matrix: List[List[float]]

@app.post("/api/dl/classify-drawing")
def api_dl_classify_drawing(req: DLClassifyDrawingRequest):
    return dl_rune_caster.classify_drawing(req.drawing_matrix)

class DLGlitchDrawingRequest(BaseModel):
    drawing_matrix: List[List[float]]
    epsilon: float = 0.28

@app.post("/api/dl/glitch-drawing")
def api_dl_glitch_drawing(req: DLGlitchDrawingRequest):
    return dl_rune_caster.glitch_drawing_fgsm(req.drawing_matrix, req.epsilon)

# --- Island 6: Reinforcement Learning ---
class RLTrainRequest(BaseModel):
    num_episodes: int = 300
    alpha: float = 0.15
    gamma: float = 0.95
    initial_epsilon: float = 1.0
    min_epsilon: float = 0.05
    epsilon_decay: float = 0.99

@app.post("/api/rl/train")
def api_rl_train(req: RLTrainRequest):
    return rl_engine.train_simulation(
        num_episodes=req.num_episodes,
        alpha=req.alpha,
        gamma=req.gamma,
        initial_epsilon=req.initial_epsilon,
        min_epsilon=req.min_epsilon,
        epsilon_decay=req.epsilon_decay
    )

class RLEchoTrainRequest(BaseModel):
    whirlpools: Optional[List[List[int]]] = None
    crystals: Optional[List[List[int]]] = None

@app.post("/api/rl/train-echo")
def api_rl_train_echo(req: RLEchoTrainRequest):
    return rl_engine.train_echo_pond(req.whirlpools, req.crystals)

# --- Island 7: Knowledge / RAG ---
class RAGQueryRequest(BaseModel):
    query: str
    top_k: int = 3

@app.post("/api/rag/retrieve")
def api_rag_retrieve(req: RAGQueryRequest):
    results = rag_engine.retrieve(req.query, top_k=req.top_k)
    return {"query": req.query, "results": results}

@app.post("/api/rag/ask")
def api_rag_ask(req: RAGQueryRequest):
    return rag_engine.answer_query(req.query)

@app.get("/api/rag/challenges")
def api_rag_challenges():
    return {"challenges": rag_engine.generate_grounded_challenges()}

class RAGIngestTextRequest(BaseModel):
    doc_id: str
    title: str
    text: str

@app.post("/api/rag/ingest-text")
def api_rag_ingest_text(req: RAGIngestTextRequest):
    return rag_engine.ingest_text(req.doc_id, req.title, req.text)

class RAGIngestURLRequest(BaseModel):
    url: str
    doc_id: str
    title: str

@app.post("/api/rag/ingest-url")
def api_rag_ingest_url(req: RAGIngestURLRequest):
    try:
        return rag_engine.ingest_url(req.url, req.doc_id, req.title)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch or parse URL: {str(e)}")

# --- Island 8: Adaptation ---
class AdaptationRequest(BaseModel):
    player_model: Dict[str, Any]
    history: Optional[List[Dict[str, Any]]] = None

@app.post("/api/adaptation/recommend")
def api_adaptation_recommend(req: AdaptationRequest):
    return adaptation_engine.evaluate_adaptation(req.player_model, req.history)

# Serve compiled frontend in single unified port
from fastapi.staticfiles import StaticFiles
client_dist = root_dir / "client" / "dist"
if client_dist.exists():
    app.mount("/", StaticFiles(directory=str(client_dist), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

