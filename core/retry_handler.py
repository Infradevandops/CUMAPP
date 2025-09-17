#!/usr/bin/env python3
"""
Retry Logic with Exponential Backoff
Handles retries for external service calls with circuit breaker patterns
"""
import asyncio
import time
import random
import logging
from typing import Callable, Any, Optional, Dict, List
from functools import wraps
from enum import Enum
from datetime import datetime, timedelta

from core.exceptions import (
    ServiceError, TextVerifiedError, TwilioError, AIServiceError,
    TextVerifiedRateLimitError, TwilioRateLimitError, ServiceTimeoutError
)

logger = logging.getLogger(__name__)


class CircuitBreakerState(Enum):
    """Circuit breaker states"""
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if service recovered


class RetryStrategy(Enum):
    """Retry strategies"""
    EXPONENTIAL_BACKOFF = "exponential_backoff"
    LINEAR_BACKOFF = "linear_backoff"
    FIXED_DELAY = "fixed_delay"
    IMMEDIATE = "immediate"


class CircuitBreaker:
    """Circuit breaker implementation for external services"""
    
    def __init__(
        self,
        service_name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: type = ServiceError
    ):
        self.service_name = service_name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitBreakerState.CLOSED
        
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection"""
        
        if self.state == CircuitBreakerState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitBreakerState.HALF_OPEN
                logger.info(f"Circuit breaker for {self.service_name} moved to HALF_OPEN")
            else:
                raise ServiceError(
                    f"Circuit breaker OPEN for {self.service_name}",
                    error_code="CIRCUIT_BREAKER_OPEN",
                    service_name=self.service_name,
                    retry_after=self.recovery_timeout
                )
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
            
        except self.expected_exception as e:
            self._on_failure()
            raise
        except Exception as e:
            # Unexpected error, don't count towards circuit breaker
            logger.error(f"Unexpected error in {self.service_name}: {e}")
            raise
    
    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to attempt reset"""
        if self.last_failure_time is None:
            return True
        return (datetime.now() - self.last_failure_time).seconds >= self.recovery_timeout
    
    def _on_success(self):
        """Handle successful call"""
        if self.state == CircuitBreakerState.HALF_OPEN:
            self.state = CircuitBreakerState.CLOSED
            self.failure_count = 0
            logger.info(f"Circuit breaker for {self.service_name} CLOSED (recovered)")
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitBreakerState.OPEN
            logger.warning(f"Circuit breaker for {self.service_name} OPENED after {self.failure_count} failures")


class RetryHandler:
    """Handles retry logic with exponential backoff"""
    
    def __init__(
        self,
        max_retries: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        strategy: RetryStrategy = RetryStrategy.EXPONENTIAL_BACKOFF,
        jitter: bool = True,
        retryable_exceptions: Optional[List[type]] = None
    ):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.strategy = strategy
        self.jitter = jitter
        self.retryable_exceptions = retryable_exceptions or [
            TextVerifiedRateLimitError,
            TwilioRateLimitError,
            ServiceTimeoutError,
            TextVerifiedServiceUnavailableError
        ]
    
    def _calculate_delay(self, attempt: int) -> float:
        """Calculate delay for the given attempt"""
        if self.strategy == RetryStrategy.EXPONENTIAL_BACKOFF:
            delay = self.base_delay * (2 ** attempt)
        elif self.strategy == RetryStrategy.LINEAR_BACKOFF:
            delay = self.base_delay * attempt
        elif self.strategy == RetryStrategy.FIXED_DELAY:
            delay = self.base_delay
        else:  # IMMEDIATE
            delay = 0
        
        # Apply maximum delay limit
        delay = min(delay, self.max_delay)
        
        # Add jitter to prevent thundering herd
        if self.jitter and delay > 0:
            delay = delay * (0.5 + random.random() * 0.5)
        
        return delay
    
    def _is_retryable(self, exception: Exception) -> bool:
        """Check if exception is retryable"""
        return any(isinstance(exception, exc_type) for exc_type in self.retryable_exceptions)
    
    def retry(self, func: Callable) -> Callable:
        """Decorator for adding retry logic to functions"""
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(self.max_retries + 1):
                try:
                    return func(*args, **kwargs)
                    
                except Exception as e:
                    last_exception = e
                    
                    if attempt == self.max_retries:
                        logger.error(f"Function {func.__name__} failed after {self.max_retries} retries: {e}")
                        raise
                    
                    if not self._is_retryable(e):
                        logger.error(f"Non-retryable error in {func.__name__}: {e}")
                        raise
                    
                    delay = self._calculate_delay(attempt)
                    logger.warning(f"Attempt {attempt + 1} failed for {func.__name__}: {e}. Retrying in {delay:.2f}s")
                    
                    # Check if exception specifies retry_after
                    if hasattr(e, 'retry_after') and e.retry_after:
                        delay = max(delay, e.retry_after)
                    
                    time.sleep(delay)
            
            raise last_exception
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(self.max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                    
                except Exception as e:
                    last_exception = e
                    
                    if attempt == self.max_retries:
                        logger.error(f"Async function {func.__name__} failed after {self.max_retries} retries: {e}")
                        raise
                    
                    if not self._is_retryable(e):
                        logger.error(f"Non-retryable error in {func.__name__}: {e}")
                        raise
                    
                    delay = self._calculate_delay(attempt)
                    logger.warning(f"Attempt {attempt + 1} failed for {func.__name__}: {e}. Retrying in {delay:.2f}s")
                    
                    # Check if exception specifies retry_after
                    if hasattr(e, 'retry_after') and e.retry_after:
                        delay = max(delay, e.retry_after)
                    
                    await asyncio.sleep(delay)
            
            raise last_exception
        
        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper


# Global circuit breakers for different services
_circuit_breakers: Dict[str, CircuitBreaker] = {}


def get_circuit_breaker(service_name: str) -> CircuitBreaker:
    """Get or create circuit breaker for service"""
    if service_name not in _circuit_breakers:
        if service_name == "textverified":
            _circuit_breakers[service_name] = CircuitBreaker(
                service_name=service_name,
                failure_threshold=3,
                recovery_timeout=300,  # 5 minutes
                expected_exception=TextVerifiedError
            )
        elif service_name == "twilio":
            _circuit_breakers[service_name] = CircuitBreaker(
                service_name=service_name,
                failure_threshold=5,
                recovery_timeout=120,  # 2 minutes
                expected_exception=TwilioError
            )
        elif service_name == "groq":
            _circuit_breakers[service_name] = CircuitBreaker(
                service_name=service_name,
                failure_threshold=3,
                recovery_timeout=180,  # 3 minutes
                expected_exception=GroqAPIError
            )
        else:
            _circuit_breakers[service_name] = CircuitBreaker(
                service_name=service_name,
                failure_threshold=5,
                recovery_timeout=60,
                expected_exception=ServiceError
            )
    
    return _circuit_breakers[service_name]


def with_circuit_breaker(service_name: str):
    """Decorator to add circuit breaker protection"""
    def decorator(func: Callable) -> Callable:
        circuit_breaker = get_circuit_breaker(service_name)
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            return circuit_breaker.call(func, *args, **kwargs)
        
        return wrapper
    return decorator


def with_retry(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    strategy: RetryStrategy = RetryStrategy.EXPONENTIAL_BACKOFF
):
    """Decorator to add retry logic"""
    def decorator(func: Callable) -> Callable:
        retry_handler = RetryHandler(
            max_retries=max_retries,
            base_delay=base_delay,
            max_delay=max_delay,
            strategy=strategy
        )
        return retry_handler.retry(func)
    return decorator


def with_retry_and_circuit_breaker(
    service_name: str,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0
):
    """Decorator combining retry logic and circuit breaker"""
    def decorator(func: Callable) -> Callable:
        # Apply retry first, then circuit breaker
        retry_handler = RetryHandler(max_retries=max_retries, base_delay=base_delay, max_delay=max_delay)
        circuit_breaker = get_circuit_breaker(service_name)
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            @retry_handler.retry
            def retryable_func():
                return circuit_breaker.call(func, *args, **kwargs)
            
            return retryable_func()
        
        return wrapper
    return decorator


# Utility functions
def get_circuit_breaker_status() -> Dict[str, Dict[str, Any]]:
    """Get status of all circuit breakers"""
    status = {}
    for service_name, breaker in _circuit_breakers.items():
        status[service_name] = {
            "state": breaker.state.value,
            "failure_count": breaker.failure_count,
            "last_failure_time": breaker.last_failure_time.isoformat() if breaker.last_failure_time else None,
            "failure_threshold": breaker.failure_threshold,
            "recovery_timeout": breaker.recovery_timeout
        }
    return status


def reset_circuit_breaker(service_name: str) -> bool:
    """Manually reset a circuit breaker"""
    if service_name in _circuit_breakers:
        breaker = _circuit_breakers[service_name]
        breaker.state = CircuitBreakerState.CLOSED
        breaker.failure_count = 0
        breaker.last_failure_time = None
        logger.info(f"Circuit breaker for {service_name} manually reset")
        return True
    return False