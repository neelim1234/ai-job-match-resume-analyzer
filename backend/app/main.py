from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, resumes, jobs, analyses

app = FastAPI(
    title="AI Job Match & Resume Analyzer",
    description="Upload your resume and get AI-powered feedback against any job description.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server to talk to this API
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(analyses.router, prefix="/api")


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
