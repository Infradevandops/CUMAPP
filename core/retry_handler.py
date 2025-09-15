#!/usr/bin/env python3
"""
Retry Handler with Exponential Backoff for CumApp Communication Platform
Provides robust retry mechanisms for external API calls and service operations
"""
import asyncio
import logging
import random
import time
from typing import Callable, Any, Optional, Type, Union, List, Dict
from functools import wraps
from dataclasses import dataclass
from enum import Enum

from core.exceptions import BaseServiceException, is_retryable_error, get_retry_delay

logger = logging.getLogger(__name__)


class RetryStrategy(Enum):
    """Retry strategy types"""
    EXPONENTIAL_BACKOFF = "exponential_backoff"
    LINEAR_BACKOFF = "linear_backoff"
    FIXED_DELAY = "fixed_delay"
    IMMEDIATE = "immediate"


@dataclass
class RetryConfig:
    """Configuration for retry behavior"""
    max_attempts: int = 3
    base_delay: float = 1.0
    max_delay: float = 300.0
    exponential_base: float = 2.0
    jitter: bool = True
    jitter_range: float = 0.1
    strategy: RetryStrategy = RetryStrategy.EXPONENTIAL_BACKOFF
    retryable_exceptions: Optional[List[Type[Exception]]] = None
    non_retryable_exceptions: Optional[List[Type[Exception]]] = None
    
    def __post_init__(self):
        """Set default retryable exceptions if not provided"""
        if self.retryable_exceptions is None:
            self.retryable_exceptions = [
                ConnectionError,
                TimeoutError,
                BaseServiceException
            ]


class RetryHandler:
    """Handles retry logic with various backoff strategies"""
    
    def __init__(self, config: Optional[RetryConfig] = None):
        """
        Initialize retry handler
        
        Args:
            config: Retry configuration
        """
        self.config = config or RetryConfig()
        self.retry_stats = {}
    
    def calculate_delay(self, attempt: int, exception: Optional[Exception] = None) -> float:
        """
        Calculate delay for retry attempt
        
        Args:
            attempt: Current attempt number (1-based)
            exception: Exception that triggered the retry
            
        Returns:
            Delay in seconds
        """
        if exception and isinstance(exception, BaseServiceException):
            # Use exception-specific retry delay if available
            if exception.retry_after:
                delay = exception.retry_after
            else:
                delay = get_retry_delay(exception, attempt)
        else:
            # Calculate delay based on strategy
            if self.config.strategy == RetryStrategy.EXPONENTIAL_BACKOFF:
                delay = self.config.base_delay * (self.config.exponential_base ** (attempt - 1))
            elif self.config.strategy == RetryStrategy.LINEAR_BACKOFF:
                delay = self.config.base_delay * attempt
            elif self.config.strategy == RetryStrategy.FIXED_DELAY:
                delay = self.config.base_delay
            else:  # IMMEDIATE
                delay = 0
        
        # Apply maximum delay limit
        delay = min(delay, self.config.max_delay)
        
        # Add jitter to prevent thundering herd
        if self.config.jitter and delay > 0:
            jitter_amount = delay * self.config.jitter_range
            delay += random.uniform(-jitter_amount, jitter_amount)
            delay = max(0, delay)  # Ensure non-negative
        
        return delay
    
    def should_retry(self, exception: Exception, attempt: int) -> bool:
        """
        Determine if an exception should trigger a retry
        
        Args:
            exception: Exception that occurred
            attempt: Current attempt number
            
        Returns:
            True if should retry
        """
        # Check attempt limit
        if attempt >= self.config.max_attempts:
            return False
        
        # Check non-retryable exceptions first
        if self.config.non_retryable_exceptions:
            for exc_type in self.config.non_retryable_exceptions:
                if isinstance(exception, exc_type):
                    return False
        
        # Check if exception is retryable
        if isinstance(exception, BaseServiceException):
            return exception.is_retryable
        
        # Check retryable exceptions list
        if self.config.retryable_exceptions:
            for exc_type in self.config.retryable_exceptions:
                if isinstance(exception, exc_type):
                    return True
        
        # Use global retry logic
        return is_retryable_error(exception)
    
    async def execute_with_retry(
        self,
        func: Callable,
        *args,
        operation_name: Optional[str] = None,
        **kwargs
    ) -> Any:
        """
        Execute function with retry logic
        
        Args:
            func: Function to execute (can be sync or async)
            *args: Function arguments
            operation_name: Name for logging/stats
            **kwargs: Function keyword arguments
            
        Returns:
            Function result
            
        Raises:
            Last exception if all retries failed
        """
        operation_name = operation_name or func.__name__
        attempt = 0
        last_exception = None
        
        # Initialize stats
        if operation_name not in self.retry_stats:
            self.retry_stats[operation_name] = {
                "total_attempts": 0,
                "successful_attempts": 0,
                "failed_attempts": 0,
                "retry_attempts": 0
            }
        
        while attempt < self.config.max_attempts:
            attempt += 1
            self.retry_stats[operation_name]["total_attempts"] += 1
            
            try:
                logger.debug(f"Executing {operation_name}, attempt {attempt}/{self.config.max_attempts}")
                
                # Execute function (handle both sync and async)
                if asyncio.iscoroutinefunction(func):
                    result = await func(*args, **kwargs)
                else:
                    result = func(*args, **kwargs)
                
                # Success
                self.retry_stats[operation_name]["successful_attempts"] += 1
                if attempt > 1:
                    logger.info(f"{operation_name} succeeded on attempt {attempt}")
                
                return result
                
            except Exception as e:
                last_exception = e
                
                # Check if we should retry
                if not self.should_retry(e, attempt):
                    logger.warning(f"{operation_name} failed with non-retryable error: {e}")
                    self.retry_stats[operation_name]["failed_attempts"] += 1
                    raise
                
                # Check if we've exhausted attempts
                if attempt >= self.config.max_attempts:
                    logger.error(f"{operation_name} failed after {attempt} attempts: {e}")
                    self.retry_stats[operation_name]["failed_attempts"] += 1
                    raise
                
                # Calculate delay and wait
                delay = self.calculate_delay(attempt, e)
                self.retry_stats[operation_name]["retry_attempts"] += 1
                
                logger.warning(
                    f"{operation_name} failed on attempt {attempt}, retrying in {delay:.2f}s: {e}"
                )
                
                if delay > 0:
                    await asyncio.sleep(delay)
        
        # This should never be reached, but just in case
        if last_exception:
            raise last_exception
        else:
            raise RuntimeError(f"Unexpected error in retry logic for {operation_name}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get retry statistics"""
        return dict(self.retry_stats)
    
    def reset_stats(self):
        """Reset retry statistics"""
        self.retry_stats.clear()


# Decorator for automatic retry
def retry(
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 300.0,
    strategy: RetryStrategy = RetryStrategy.EXPONENTIAL_BACKOFF,
    retryable_exceptions: Optional[List[Type[Exception]]] = None,
    non_retryable_exceptions: Optional[List[Type[Exception]]] = None,
    jitter: bool = True
):
    """
    Decorator to add retry logic to functions
    
    Args:
        max_attempts: Maximum number of attempts
        base_delay: Base delay in seconds
        max_delay: Maximum delay in seconds
        strategy: Retry strategy
        retryable_exceptions: List of retryable exception types
        non_retryable_exceptions: List of non-retryable exception types
        jitter: Whether to add jitter to delays
    """
    def decorator(func):
        config = RetryConfig(
            max_attempts=max_attempts,
            base_delay=base_delay,
            max_delay=max_delay,
            strategy=strategy,
            retryable_exceptions=retryable_exceptions,
            non_retryable_exceptions=non_retryable_exceptions,
            jitter=jitter
        )
        handler = RetryHandler(config)
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            return await handler.execute_with_retry(func, *args, **kwargs)
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # For sync functions, we need to run in an event loop
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            return loop.run_until_complete(
                handler.execute_with_retry(func, *args, **kwargs)
            )
        
        # Return appropriate wrapper based on function type
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# Specialized retry configurations for different services
class ServiceRetryConfigs:
    """Predefined retry configurations for different services"""
    
    @staticmethod
    def textverified() -> RetryConfig:
        """Retry configuration for TextVerified API"""
        return RetryConfig(
            max_attempts=3,
            base_delay=2.0,
            max_delay=120.0,
            strategy=RetryStrategy.EXPONENTIAL_BACKOFF,
            retryable_exceptions=[
                ConnectionError,
                TimeoutError,
                BaseServiceException
            ],
            non_retryable_exceptions=[
                # Add TextVerified-specific non-retryable exceptions
            ]
        )
    
    @staticmethod
    def twilio() -> RetryConfig:
        """Retry configuration for Twilio API"""
        return RetryConfig(
            max_attempts=4,
            base_delay=1.0,
            max_delay=60.0,
            strategy=RetryStrategy.EXPONENTIAL_BACKOFF,
            retryable_exceptions=[
                ConnectionError,
                TimeoutError,
                BaseServiceException
            ]
        )
    
    @staticmethod
    def database() -> RetryConfig:
        """Retry configuration for database operations"""
        return RetryConfig(
            max_attempts=5,
            base_delay=0.5,
            max_delay=30.0,
            strategy=RetryStrategy.EXPONENTIAL_BACKOFF,
            jitter_range=0.2
        )
    
    @staticmethod
    def ai_service() -> RetryConfig:
        """Retry configuration for AI service calls"""
        return RetryConfig(
            max_attempts=3,
            base_delay=5.0,
            max_delay=300.0,
            strategy=RetryStrategy.EXPONENTIAL_BACKOFF
        )


# Global retry handlers for different services
textverified_retry = RetryHandler(ServiceRetryConfigs.textverified())
twilio_retry = RetryHandler(ServiceRetryConfigs.twilio())
database_retry = RetryHandler(ServiceRetryConfigs.database())
ai_service_retry = RetryHandler(ServiceRetryConfigs.ai_service())


# Convenience decorators for specific services
def textverified_retry_decorator(func):
    """Decorator for TextVerified API calls"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await textverified_retry.execute_with_retry(func, *args, **kwargs)
    return wrapper


def twilio_retry_decorator(func):
    """Decorator for Twilio API calls"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await twilio_retry.execute_with_retry(func, *args, **kwargs)
    return wrapper


def database_retry_decorator(func):
    """Decorator for database operations"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await database_retry.execute_with_retry(func, *args, **kwargs)
    return wrapper


def ai_service_retry_decorator(func):
    """Decorator for AI service calls"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await ai_service_retry.execute_with_retry(func, *args, **kwargs)
    return wrapper