#!/usr/bin/env python3
"""
Security utilities for input validation and sanitization
"""
import re
import html
import logging
from typing import Any, Dict, List, Optional, Union
from urllib.parse import quote, unquote

logger = logging.getLogger(__name__)


class InputSanitizer:
    """Utility class for sanitizing user inputs"""
    
    # Common XSS patterns
    XSS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'vbscript:',
        r'onload\s*=',
        r'onerror\s*=',
        r'onclick\s*=',
        r'onmouseover\s*=',
        r'onfocus\s*=',
        r'onblur\s*=',
        r'eval\s*\(',
        r'expression\s*\(',
        r'<iframe[^>]*>.*?</iframe>',
        r'<object[^>]*>.*?</object>',
        r'<embed[^>]*>.*?</embed>',
    ]
    
    # SQL injection patterns
    SQL_PATTERNS = [
        r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)',
        r'(\b(OR|AND)\s+\d+\s*=\s*\d+)',
        r'(\b(OR|AND)\s+[\'"][^\'"]*[\'"])',
        r'(--|\#|/\*|\*/)',
        r'(\bxp_cmdshell\b)',
        r'(\bsp_executesql\b)',
    ]
    
    @classmethod
    def sanitize_string(cls, value: str, max_length: Optional[int] = None) -> str:
        """Sanitize a string input"""
        if not isinstance(value, str):
            return str(value)
        
        # Remove null bytes
        value = value.replace('\x00', '')
        
        # HTML encode to prevent XSS
        value = html.escape(value)
        
        # Remove potentially dangerous patterns
        for pattern in cls.XSS_PATTERNS:
            value = re.sub(pattern, '', value, flags=re.IGNORECASE)
        
        # Truncate if max_length specified
        if max_length and len(value) > max_length:
            value = value[:max_length]
            
        return value.strip()
    
    @classmethod
    def sanitize_email(cls, email: str) -> str:
        """Sanitize email address"""
        if not email:
            return ""
        
        # Basic email validation pattern
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        # Remove whitespace and convert to lowercase
        email = email.strip().lower()
        
        # Validate format
        if not re.match(email_pattern, email):
            raise ValueError("Invalid email format")
        
        return email
    
    @classmethod
    def sanitize_phone(cls, phone: str) -> str:
        """Sanitize phone number"""
        if not phone:
            return ""
        
        # Remove all non-digit characters except +
        phone = re.sub(r'[^\d+]', '', phone)
        
        # Validate basic phone format
        if not re.match(r'^\+?[\d]{10,15}$', phone):
            raise ValueError("Invalid phone number format")
        
        return phone
    
    @classmethod
    def check_sql_injection(cls, value: str) -> bool:
        """Check if string contains SQL injection patterns"""
        if not isinstance(value, str):
            return False
        
        value_lower = value.lower()
        for pattern in cls.SQL_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                logger.warning(f"Potential SQL injection detected: {pattern}")
                return True
        
        return False
    
    @classmethod
    def sanitize_dict(cls, data: Dict[str, Any], max_string_length: int = 1000) -> Dict[str, Any]:
        """Recursively sanitize dictionary values"""
        if not isinstance(data, dict):
            return data
        
        sanitized = {}
        for key, value in data.items():
            # Sanitize key
            clean_key = cls.sanitize_string(str(key), max_length=100)
            
            # Sanitize value based on type
            if isinstance(value, str):
                # Check for SQL injection
                if cls.check_sql_injection(value):
                    raise ValueError(f"Potential SQL injection in field: {key}")
                
                sanitized[clean_key] = cls.sanitize_string(value, max_string_length)
            elif isinstance(value, dict):
                sanitized[clean_key] = cls.sanitize_dict(value, max_string_length)
            elif isinstance(value, list):
                sanitized[clean_key] = [
                    cls.sanitize_string(str(item), max_string_length) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                sanitized[clean_key] = value
        
        return sanitized


class PasswordValidator:
    """Password strength validation"""
    
    MIN_LENGTH = 8
    MAX_LENGTH = 128
    
    @classmethod
    def validate_strength(cls, password: str) -> Dict[str, Union[bool, str]]:
        """Validate password strength and return detailed feedback"""
        if not password:
            return {"valid": False, "message": "Password is required"}
        
        if len(password) < cls.MIN_LENGTH:
            return {"valid": False, "message": f"Password must be at least {cls.MIN_LENGTH} characters"}
        
        if len(password) > cls.MAX_LENGTH:
            return {"valid": False, "message": f"Password must be no more than {cls.MAX_LENGTH} characters"}
        
        # Check for required character types
        has_upper = bool(re.search(r'[A-Z]', password))
        has_lower = bool(re.search(r'[a-z]', password))
        has_digit = bool(re.search(r'\d', password))
        has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
        
        missing = []
        if not has_upper:
            missing.append("uppercase letter")
        if not has_lower:
            missing.append("lowercase letter")
        if not has_digit:
            missing.append("number")
        if not has_special:
            missing.append("special character")
        
        if missing:
            return {
                "valid": False, 
                "message": f"Password must contain at least one: {', '.join(missing)}"
            }
        
        # Check for common weak patterns
        weak_patterns = [
            r'(.)\1{2,}',  # Repeated characters
            r'(012|123|234|345|456|567|678|789|890)',  # Sequential numbers
            r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)',  # Sequential letters
        ]
        
        for pattern in weak_patterns:
            if re.search(pattern, password.lower()):
                return {"valid": False, "message": "Password contains weak patterns"}
        
        return {"valid": True, "message": "Password is strong"}
    
    @classmethod
    def calculate_strength_score(cls, password: str) -> int:
        """Calculate password strength score (0-100)"""
        if not password:
            return 0
        
        score = 0
        
        # Length bonus
        score += min(len(password) * 2, 25)
        
        # Character variety bonus
        if re.search(r'[a-z]', password):
            score += 10
        if re.search(r'[A-Z]', password):
            score += 10
        if re.search(r'\d', password):
            score += 10
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 15
        
        # Complexity bonus
        unique_chars = len(set(password))
        score += min(unique_chars * 2, 20)
        
        # Penalty for common patterns
        if re.search(r'(.)\1{2,}', password):
            score -= 10
        if re.search(r'(012|123|234|345|456|567|678|789|890)', password):
            score -= 10
        
        return max(0, min(score, 100))


def sanitize_request_data(data: Any) -> Any:
    """Main function to sanitize request data"""
    try:
        if isinstance(data, dict):
            return InputSanitizer.sanitize_dict(data)
        elif isinstance(data, str):
            return InputSanitizer.sanitize_string(data)
        elif isinstance(data, list):
            return [sanitize_request_data(item) for item in data]
        else:
            return data
    except Exception as e:
        logger.error(f"Error sanitizing data: {e}")
        raise ValueError("Invalid input data")


def validate_password_strength(password: str) -> Dict[str, Union[bool, str, int]]:
    """Validate password and return strength info"""
    validation = PasswordValidator.validate_strength(password)
    score = PasswordValidator.calculate_strength_score(password)
    
    return {
        **validation,
        "score": score,
        "strength": "weak" if score < 40 else "medium" if score < 70 else "strong"
    }