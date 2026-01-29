from datetime import datetime, timezone
from typing import Dict, Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

CadenceProfile = Literal["normal", "strong"]


class SessionCreate(BaseModel):
    text: str
    wpm: int = Field(ge=250, le=1200)
    cadenceProfile: CadenceProfile


class SessionData(SessionCreate):
    sessionId: str
    createdAt: str
    progressIndex: int = 0


class SessionProgress(BaseModel):
    progressIndex: int = Field(ge=0)


app = FastAPI(title="Speed Reader API")

sessions: Dict[str, SessionData] = {}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/session")
def create_session(payload: SessionCreate):
    session_id = uuid4().hex[:8]
    created_at = datetime.now(timezone.utc).isoformat()
    session = SessionData(
        sessionId=session_id,
        createdAt=created_at,
        progressIndex=0,
        **payload.model_dump(),
    )
    sessions[session_id] = session
    return {"sessionId": session_id, "createdAt": created_at}


@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "text": session.text,
        "wpm": session.wpm,
        "cadenceProfile": session.cadenceProfile,
        "progressIndex": session.progressIndex,
    }


@app.patch("/api/session/{session_id}")
def update_session(session_id: str, payload: SessionProgress):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.progressIndex = payload.progressIndex
    sessions[session_id] = session
    return {"progressIndex": session.progressIndex}
