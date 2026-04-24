from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import trips, history, exports, feedback, admin

app = FastAPI(
    title="Tripwise API",
    description="智能旅游规划 Agent 编排平台",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(history.router, prefix="/api", tags=["history"])
app.include_router(exports.router, prefix="/api/trips", tags=["exports"])
app.include_router(feedback.router, prefix="/api/trips", tags=["feedback"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "tripwise-api"}
