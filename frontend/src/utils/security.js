/**
 * Client-side security utilities for input validation and sanitization
 */

// XSS prevention patterns
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /onfocus\s*=/gi,
  /onblur\s*=/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>.*?<\/embed>/gi,
];

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input, maxLength = null) => {
  if (typeof input !== 'string') {
    return String(input);
  }

  let sanitized = input;

  // Remove null bytes
  sanitized = sanitized.replace(/\x00/g, '');

  // HTML encode dangerous characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Truncate if max length specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Sanitize phone number (remove non-digits except +)
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone number
 */
export const sanitizePhone = (phone) => {
  return phone.replace(/[^\d+]/g, '');
};

/**
 * Password strength validation
 * @param {string} password - Password to validate
 * @returns {object} Validation result with score and feedback
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return { valid: false, score: 0, message: 'Password is required', strength: 'weak' };
  }

  const minLength = 8;
  const maxLength = 128;

  if (password.length < minLength) {
    return { 
      valid: false, 
      score: 0, 
      message: `Password must be at least ${minLength} characters`, 
      strength: 'weak' 
    };
  }

  if (password.length > maxLength) {
    return { 
      valid: false, 
      score: 0, 
      message: `Password must be no more than ${maxLength} characters`, 
      strength: 'weak' 
    };
  }

  // Check character requirements
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const missing = [];
  if (!hasUpper) missing.push('uppercase letter');
  if (!hasLower) missing.push('lowercase letter');
  if (!hasDigit) missing.push('number');
  if (!hasSpecial) missing.push('special character');

  if (missing.length > 0) {
    return {
      valid: false,
      score: 20,
      message: `Password must contain at least one: ${missing.join(', ')}`,
      strength: 'weak'
    };
  }

  // Calculate strength score
  let score = 0;

  // Length bonus
  score += Math.min(password.length * 2, 25);

  // Character variety bonus
  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  if (hasDigit) score += 10;
  if (hasSpecial) score += 15;

  // Unique characters bonus
  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars * 2, 20);

  // Penalty for weak patterns
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/(012|123|234|345|456|567|678|789|890)/.test(password)) score -= 10; // Sequential numbers

  score = Math.max(0, Math.min(score, 100));

  const strength = score < 40 ? 'weak' : score < 70 ? 'medium' : 'strong';

  return {
    valid: true,
    score,
    message: `Password strength: ${strength}`,
    strength
  };
};

/**
 * Sanitize form data object
 * @param {object} data - Form data to sanitize
 * @param {number} maxStringLength - Maximum string length
 * @returns {object} Sanitized form data
 */
export const sanitizeFormData = (data, maxStringLength = 1000) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = {};

  Object.keys(data).forEach(key => {
    const value = data[key];
    const cleanKey = sanitizeString(key, 100);

    if (typeof value === 'string') {
      sanitized[cleanKey] = sanitizeString(value, maxStringLength);
    } else if (Array.isArray(value)) {
      sanitized[cleanKey] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item, maxStringLength) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[cleanKey] = sanitizeFormData(value, maxStringLength);
    } else {
      sanitized[cleanKey] = value;
    }
  });

  return sanitized;
};

/**
 * Check if URL is safe (prevent open redirects)
 * @param {string} url - URL to check
 * @returns {boolean} True if URL is safe
 */
export const isSafeUrl = (url) => {
  if (!url) return false;

  // Allow relative URLs
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }

  // Allow same origin URLs
  try {
    const urlObj = new URL(url);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};

/**
 * Escape HTML to prevent XSS in dynamic content
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 */
export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Generate Content Security Policy nonce for inline scripts
 * @returns {string} Random nonce value
 */
export const generateNonce = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};