import sqlite3
import json
import os
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(__file__), "odyssey.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS game_sessions (
        session_id TEXT PRIMARY KEY,
        player_data TEXT,
        ship_data TEXT,
        progress_data TEXT,
        player_model TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        event_type TEXT,
        payload TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS research_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        island_id TEXT,
        metric_name TEXT,
        metric_value REAL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS rag_documents (
        id TEXT PRIMARY KEY,
        title TEXT,
        source_type TEXT,
        total_chunks INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()

def save_game_state(session_id: str, state: Dict[str, Any]):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    INSERT OR REPLACE INTO game_sessions (session_id, player_data, ship_data, progress_data, player_model, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """, (
        session_id,
        json.dumps(state.get("player", {})),
        json.dumps(state.get("ship", {})),
        json.dumps(state.get("progress", {})),
        json.dumps(state.get("playerModel", {}))
    ))
    conn.commit()
    conn.close()

def load_game_state(session_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT player_data, ship_data, progress_data, player_model FROM game_sessions WHERE session_id = ?", (session_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "player": json.loads(row[0]),
        "ship": json.loads(row[1]),
        "progress": json.loads(row[2]),
        "playerModel": json.loads(row[3])
    }

def log_telemetry(session_id: str, event_type: str, payload: Dict[str, Any]):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO telemetry_events (session_id, event_type, payload) VALUES (?, ?, ?)",
                (session_id, event_type, json.dumps(payload)))
    conn.commit()
    conn.close()

def log_research_metric(session_id: str, island_id: str, metric_name: str, metric_value: float, details: Dict[str, Any]):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO research_logs (session_id, island_id, metric_name, metric_value, details) VALUES (?, ?, ?, ?, ?)",
                (session_id, island_id, metric_name, metric_value, json.dumps(details)))
    conn.commit()
    conn.close()

def get_research_data() -> Dict[str, Any]:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT island_id, metric_name, AVG(metric_value), COUNT(*) FROM research_logs GROUP BY island_id, metric_name")
    summary = cur.fetchall()
    cur.execute("SELECT session_id, event_type, payload, created_at FROM telemetry_events ORDER BY id DESC LIMIT 50")
    events = cur.fetchall()
    conn.close()
    return {
        "summary": [{"island": r[0], "metric": r[1], "avg_value": round(r[2], 2), "sample_count": r[3]} for r in summary],
        "recent_events": [{"session_id": e[0], "type": e[1], "payload": json.loads(e[2]), "time": e[3]} for e in events]
    }

