from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import agents, security_tests, results, events, tool_calls, dashboard, reports
from seed_data import seed_database

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack AI Agent Security Assessment & Governance Platform"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(agents.router, prefix=settings.API_PREFIX)
app.include_router(security_tests.router, prefix=settings.API_PREFIX)
app.include_router(results.router, prefix=settings.API_PREFIX)
app.include_router(events.router, prefix=settings.API_PREFIX)
app.include_router(tool_calls.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def on_startup():
    seed_database()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "llm_provider": settings.LLM_PROVIDER
    }
