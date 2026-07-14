import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
# slowapi rate limiter imports removed

from app.core.config import settings
# limiter import removed
from app.routers import auth, policies, claims, documents, recommendations, admin
from app.db.base import Base
from app.db.session import engine

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Auto-create SQLite tables for local/testing environment on startup
if settings.DATABASE_URL.startswith("sqlite"):
    logger.info("Initializing SQLite tables...")
    Base.metadata.create_all(bind=engine)

app = FastAPI(
      title="InsureAI API",
      description="Production-ready FastAPI backend for InsureAI insurance platform.",
      version="1.0.0"
)

# Rate limiting handled dynamically via routing dependencies

# Enforce CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(policies.router)
app.include_router(claims.router)
app.include_router(documents.router)
app.include_router(recommendations.router)
app.include_router(admin.router)

# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation failed for request on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def global_unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled system error occurred on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to InsureAI API Gateway", "status": "healthy"}
