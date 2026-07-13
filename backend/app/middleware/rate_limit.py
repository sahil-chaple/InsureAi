import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, HTTPException, status

class InMemoryLimiter:
    def __init__(self, requests_limit: int = 5, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.history: Dict[str, List[float]] = defaultdict(list)

    def is_rate_limited(self, ip: str) -> bool:
        now = time.time()
        # Filter out timestamps outside the sliding window
        self.history[ip] = [t for t in self.history[ip] if now - t < self.window_seconds]
        
        if len(self.history[ip]) >= self.requests_limit:
            return True
            
        self.history[ip].append(now)
        return False

# Rate limiter instance: 5 requests per 60 seconds (1 minute)
limiter = InMemoryLimiter(requests_limit=5, window_seconds=60)

def rate_limit(request: Request):
    """
    FastAPI dependency to rate limit endpoints based on client IP.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    if limiter.is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded: Limit is 5 requests per minute per IP."
        )
