#!/usr/bin/env python3
"""
Custom Exception Classes for CumApp Communication Platform
Provides service-specific error handling for TextVerified, Twilio, and other integrations
"""
from enum import Enum
from typing import Any, Dict, Optional


class ErrorSeverity(Enum):
    """Error severity levels"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorCategory(Enum):
    """Error categories for classification"""

    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    VALIDATION = "validation"
    RATE_LIMIT = "rate_limit"
    NETWORK = "network"
    SERVICE_UNAVAILABLE = "service_unavailable"
    CONFIGURATION = "configuration"
    DATA_INTEGRITY = "data_integrity"
    BUSINESS_LOGIC = "business_logic"
    EXTERNAL_API = "external_api"


class BaseServiceException(Exception):
    """Base exception class for all service-specific errors"""

    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        category: ErrorCategory = ErrorCategory.EXTERNAL_API,
        details: Optional[Dict[str, Any]] = None,
        retry_after: Optional[int] = None,
        is_retryable: bool = False,
    ):
        """
        Initialize base service exception

        Args:
            message: Human-readable error message
            error_code: Service-specific error code
            severity: Error severity level
            category: Error category for classification
            details: Additional error details
            retry_after: Seconds to wait before retry (if applicable)
            is_retryable: Whether this error can be retried
        """
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.severity = severity
        self.category = category
        self.details = details or {}
        self.retry_after = retry_after
        self.is_retryable = is_retryable

    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for logging/serialization"""
        return {
            "error_type": self.__class__.__name__,
            "message": self.message,
            "error_code": self.error_code,
            "severity": self.severity.value,
            "category": self.category.value,
            "details": self.details,
            "retry_after": self.retry_after,
            "is_retryable": self.is_retryable,
        }


# TextVerified-specific exceptions
class TextVerifiedException(BaseServiceException):
    """Base exception for TextVerified API errors"""

    def __init__(self, message: str, **kwargs):
        super().__init__(message, category=ErrorCategory.EXTERNAL_API, **kwargs)


class TextVerifiedAuthenticationError(TextVerifiedException):
    """TextVerified authentication/authorization errors"""

    def __init__(self, message: str = "TextVerified authentication failed", **kwargs):
        super().__init__(
            message,
            error_code="TV_AUTH_FAILED",
            severity=ErrorSeverity.HIGH,
            category=ErrorCategory.AUTHENTICATION,
            is_retryable=False,
            **kwargs,
        )


class TextVerifiedInsufficientBalanceError(TextVerifiedException):
    """TextVerified insufficient balance error"""

    def __init__(self, message: str = "Insufficient TextVerified balance", **kwargs):
        super().__init__(
            message,
            error_code="TV_INSUFFICIENT_BALANCE",
            severity=ErrorSeverity.HIGH,
            category=ErrorCategory.BUSINESS_LOGIC,
            is_retryable=False,
            **kwargs,
        )


class TextVerifiedServiceUnavailableError(TextVerifiedException):
    """TextVerified service unavailable error"""

    def __init__(self, message: str = "TextVerified service unavailable", **kwargs):
        super().__init__(
            message,
            error_code="TV_SERVICE_UNAVAILABLE",
            severity=ErrorSeverity.HIGH,
            category=ErrorCategory.SERVICE_UNAVAILABLE,
            is_retryable=True,
            retry_after=kwargs.get("retry_after", 60),
            **kwargs,
        )


class TextVerifiedRateLimitError(TextVerifiedException):
    """TextVerified rate limit exceeded error"""

    def __init__(self, message: str = "TextVerified rate limit exceeded", **kwargs):
        super().__init__(
            message,
            error_code="TV_RATE_LIMIT",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.RATE_LIMIT,
            is_retryable=True,
            retry_after=kwargs.get("retry_after", 300),
            **kwargs,
        )


class TextVerifiedVerificationNotFoundError(TextVerifiedException):
    """TextVerified verification not found error"""

    def __init__(self, verification_id: str, **kwargs):
        message = f"TextVerified verification not found: {verification_id}"
        super().__init__(
            message,
            error_code="TV_VERIFICATION_NOT_FOUND",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.DATA_INTEGRITY,
            is_retryable=False,
            details={"verification_id": verification_id},
            **kwargs,
        )


class TextVerifiedServiceNotSupportedError(TextVerifiedException):
    """TextVerified service not supported error"""

    def __init__(self, service_name: str, **kwargs):
        message = f"Service not supported by TextVerified: {service_name}"
        super().__init__(
            message,
            error_code="TV_SERVICE_NOT_SUPPORTED",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.VALIDATION,
            is_retryable=False,
            details={"service_name": service_name},
            **kwargs,
        )


# Twilio-specific exceptions
class TwilioException(BaseServiceException):
    """Base exception for Twilio API errors"""

    def __init__(self, message: str, **kwargs):
        super().__init__(message, category=ErrorCategory.EXTERNAL_API, **kwargs)


class TwilioAuthenticationError(TwilioException):
    """Twilio authentication/authorization errors"""

    def __init__(self, message: str = "Twilio authentication failed", **kwargs):
        super().__init__(
            message,
            error_code="TW_AUTH_FAILED",
            severity=ErrorSeverity.HIGH,
            category=ErrorCategory.AUTHENTICATION,
            is_retryable=False,
            **kwargs,
        )


class TwilioInsufficientFundsError(TwilioException):
    """Twilio insufficient funds error"""

    def __init__(self, message: str = "Insufficient Twilio account balance", **kwargs):
        super().__init__(
            message,
            error_code="TW_INSUFFICIENT_FUNDS",
            severity=ErrorSeverity.HIGH,
            category=ErrorCategory.BUSINESS_LOGIC,
            is_retryable=False,
            **kwargs,
        )


class TwilioRateLimitError(TwilioException):
    """Twilio rate limit exceeded error"""

    def __init__(self, message: str = "Twilio rate limit exceeded", **kwargs):
        super().__init__(
            message,
            error_code="TW_RATE_LIMIT",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.RATE_LIMIT,
            is_retryable=True,
            retry_after=kwargs.get("retry_after", 60),
            **kwargs,
        )


class TwilioInvalidPhoneNumberError(TwilioException):
    """Twilio invalid phone number error"""

    def __init__(self, phone_number: str, **kwargs):
        message = f"Invalid phone number format: {phone_number}"
        super().__init__(
            message,
            error_code="TW_INVALID_PHONE_NUMBER",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.VALIDATION,
            is_retryable=False,
            details={"phone_number": phone_number},
            **kwargs,
        )


class TwilioNumberNotAvailableError(TwilioException):
    """Twilio phone number not available error"""

    def __init__(self, phone_number: str, **kwargs):
        message = f"Phone number not available: {phone_number}"
        super().__init__(
            message,
            error_code="TW_NUMBER_NOT_AVAILABLE",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.BUSINESS_LOGIC,
            is_retryable=False,
            details={"phone_number": phone_number},
            **kwargs,
        )


class TwilioServiceUnavailableError(TwilioException):
    """Twilio service unavailable error"""

    def __init__(self, message: str = "Twilio service unavailable", **kwargs):
        super().__init__(
            message,
            error_code="TW_SERVICE_UNAVAILABLE",
            severity=ErrorSeverity.HIGH,
            category=ErrorCategory.SERVICE_UNAVAILABLE,
            is_retryable=True,
            retry_after=kwargs.get("retry_after", 60),
            **kwargs,
        )


class TwilioWebhookValidationError(TwilioException):
    """Twilio webhook validation error"""

    def __init__(self, message: str = "Twilio webhook validation failed", **kwargs):
        super().__init__(
            message,
            error_code="TW_WEBHOOK_VALIDATION_FAILED",
            severity=ErrorSeverity.HIGH,
            category=ErrorCategory.AUTHENTICATION,
            is_retryable=False,
            **kwargs,
        )


# Database-specific exceptions
class DatabaseException(BaseServiceException):
    """Base exception for database errors"""

    def __init__(self, message: str, **kwargs):
        super().__init__(message, category=ErrorCategory.DATA_INTEGRITY, **kwargs)


class DatabaseConnectionError(DatabaseException):
    """Database connection error"""

    def __init__(self, message: str = "Database connection failed", **kwargs):
        super().__init__(
            message,
            error_code="DB_CONNECTION_FAILED",
            severity=ErrorSeverity.CRITICAL,
            category=ErrorCategory.SERVICE_UNAVAILABLE,
            is_retryable=True,
            retry_after=kwargs.get("retry_after", 30),
            **kwargs,
        )


class DatabaseIntegrityError(DatabaseException):
    """Database integrity constraint error"""

    def __init__(self, message: str, constraint: Optional[str] = None, **kwargs):
        super().__init__(
            message,
            error_code="DB_INTEGRITY_ERROR",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.DATA_INTEGRITY,
            is_retryable=False,
            details={"constraint": constraint} if constraint else {},
            **kwargs,
        )


class DatabaseTimeoutError(DatabaseException):
    """Database operation timeout error"""

    def __init__(self, message: str = "Database operation timed out", **kwargs):
        super().__init__(
            message,
            error_code="DB_TIMEOUT",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.SERVICE_UNAVAILABLE,
            is_retryable=True,
            retry_after=kwargs.get("retry_after", 10),
            **kwargs,
        )


# Business logic exceptions
class BusinessLogicException(BaseServiceException):
    """Base exception for business logic errors"""

    def __init__(self, message: str, **kwargs):
        super().__init__(message, category=ErrorCategory.BUSINESS_LOGIC, **kwargs)


class InsufficientCreditsError(BusinessLogicException):
    """User has insufficient credits error"""

    def __init__(self, required_credits: float, available_credits: float, **kwargs):
        message = f"Insufficient credits: required {required_credits}, available {available_credits}"
        super().__init__(
            message,
            error_code="INSUFFICIENT_CREDITS",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.BUSINESS_LOGIC,
            is_retryable=False,
            details={
                "required_credits": required_credits,
                "available_credits": available_credits,
            },
            **kwargs,
        )


class SubscriptionLimitExceededError(BusinessLogicException):
    """Subscription limit exceeded error"""

    def __init__(self, limit_type: str, current_usage: int, limit: int, **kwargs):
        message = f"{limit_type} limit exceeded: {current_usage}/{limit}"
        super().__init__(
            message,
            error_code="SUBSCRIPTION_LIMIT_EXCEEDED",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.BUSINESS_LOGIC,
            is_retryable=False,
            details={
                "limit_type": limit_type,
                "current_usage": current_usage,
                "limit": limit,
            },
            **kwargs,
        )


class VerificationExpiredError(BusinessLogicException):
    """Verification request expired error"""

    def __init__(self, verification_id: str, **kwargs):
        message = f"Verification expired: {verification_id}"
        super().__init__(
            message,
            error_code="VERIFICATION_EXPIRED",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.BUSINESS_LOGIC,
            is_retryable=False,
            details={"verification_id": verification_id},
            **kwargs,
        )


# Configuration and validation exceptions
class ConfigurationError(BaseServiceException):
    """Configuration error"""

    def __init__(self, message: str, config_key: Optional[str] = None, **kwargs):
        super().__init__(
            message,
            error_code="CONFIGURATION_ERROR",
            severity=ErrorSeverity.HIGH,
            category=ErrorCategory.CONFIGURATION,
            is_retryable=False,
            details={"config_key": config_key} if config_key else {},
            **kwargs,
        )


class ValidationError(BaseServiceException):
    """Input validation error"""

    def __init__(self, message: str, field: Optional[str] = None, **kwargs):
        super().__init__(
            message,
            error_code="VALIDATION_ERROR",
            severity=ErrorSeverity.LOW,
            category=ErrorCategory.VALIDATION,
            is_retryable=False,
            details={"field": field} if field else {},
            **kwargs,
        )


# Network and connectivity exceptions
class NetworkException(BaseServiceException):
    """Base exception for network errors"""

    def __init__(self, message: str, **kwargs):
        super().__init__(message, category=ErrorCategory.NETWORK, **kwargs)


class NetworkTimeoutError(NetworkException):
    """Network timeout error"""

    def __init__(self, message: str = "Network request timed out", **kwargs):
        super().__init__(
            message,
            error_code="NETWORK_TIMEOUT",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.NETWORK,
            is_retryable=True,
            retry_after=kwargs.get("retry_after", 30),
            **kwargs,
        )


class NetworkConnectionError(NetworkException):
    """Network connection error"""

    def __init__(self, message: str = "Network connection failed", **kwargs):
        super().__init__(
            message,
            error_code="NETWORK_CONNECTION_FAILED",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.NETWORK,
            is_retryable=True,
            retry_after=kwargs.get("retry_after", 60),
            **kwargs,
        )


# AI Service exceptions
class AIServiceException(BaseServiceException):
    """Base exception for AI service errors"""

    def __init__(self, message: str, **kwargs):
        super().__init__(message, category=ErrorCategory.EXTERNAL_API, **kwargs)


class AIModelNotAvailableError(AIServiceException):
    """AI model not available error"""

    def __init__(self, model_name: str, **kwargs):
        message = f"AI model not available: {model_name}"
        super().__init__(
            message,
            error_code="AI_MODEL_NOT_AVAILABLE",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.SERVICE_UNAVAILABLE,
            is_retryable=True,
            retry_after=kwargs.get("retry_after", 120),
            details={"model_name": model_name},
            **kwargs,
        )


class AIProcessingError(AIServiceException):
    """AI processing error"""

    def __init__(self, message: str = "AI processing failed", **kwargs):
        super().__init__(
            message,
            error_code="AI_PROCESSING_ERROR",
            severity=ErrorSeverity.MEDIUM,
            category=ErrorCategory.EXTERNAL_API,
            is_retryable=True,
            retry_after=kwargs.get("retry_after", 30),
            **kwargs,
        )


# Exception mapping utilities
def map_textverified_error(
    error_code: str, message: str, **kwargs
) -> TextVerifiedException:
    """Map TextVerified error codes to specific exceptions"""
    error_mapping = {
        "401": TextVerifiedAuthenticationError,
        "403": TextVerifiedAuthenticationError,
        "402": TextVerifiedInsufficientBalanceError,
        "429": TextVerifiedRateLimitError,
        "503": TextVerifiedServiceUnavailableError,
        "404": TextVerifiedVerificationNotFoundError,
    }

    exception_class = error_mapping.get(error_code, TextVerifiedException)
    return exception_class(message, **kwargs)


def map_twilio_error(error_code: str, message: str, **kwargs) -> TwilioException:
    """Map Twilio error codes to specific exceptions"""
    error_mapping = {
        "20003": TwilioAuthenticationError,
        "20005": TwilioAuthenticationError,
        "20429": TwilioRateLimitError,
        "21211": TwilioInvalidPhoneNumberError,
        "21612": TwilioNumberNotAvailableError,
        "20500": TwilioServiceUnavailableError,
        "11200": TwilioWebhookValidationError,
    }

    exception_class = error_mapping.get(error_code, TwilioException)
    return exception_class(message, **kwargs)


def is_retryable_error(exception: Exception) -> bool:
    """Check if an exception is retryable"""
    if isinstance(exception, BaseServiceException):
        return exception.is_retryable

    # Default retry logic for common exceptions
    retryable_types = (
        ConnectionError,
        TimeoutError,
        NetworkTimeoutError,
        NetworkConnectionError,
        DatabaseConnectionError,
        DatabaseTimeoutError,
        TwilioServiceUnavailableError,
        TextVerifiedServiceUnavailableError,
    )

    return isinstance(exception, retryable_types)


def get_retry_delay(exception: Exception, attempt: int = 1) -> int:
    """Get retry delay for an exception"""
    if isinstance(exception, BaseServiceException) and exception.retry_after:
        return exception.retry_after

    # Default exponential backoff: 2^attempt seconds, max 300 seconds
    return min(2**attempt, 300)
