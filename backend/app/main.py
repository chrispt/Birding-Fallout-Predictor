from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.routes import weather, predictions, hotspots, regions

settings = get_settings()

app = FastAPI(
    title="Birding Fallout Predictor API",
    description="Predict prime conditions for birding fallouts across the Lower 48 US States",
    version="1.0.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(weather.router, prefix=f"{settings.api_v1_prefix}/weather", tags=["weather"])
app.include_router(predictions.router, prefix=f"{settings.api_v1_prefix}/predictions", tags=["predictions"])
app.include_router(hotspots.router, prefix=f"{settings.api_v1_prefix}/hotspots", tags=["hotspots"])
app.include_router(regions.router, prefix=f"{settings.api_v1_prefix}/regions", tags=["regions"])


@app.get("/")
async def root():
    return {
        "name": "Birding Fallout Predictor API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
