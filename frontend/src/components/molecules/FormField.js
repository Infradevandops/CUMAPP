import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Input from '../atoms/Input';
import { Icon } from '../atoms';

const FormField = ({ 
  label, 
  id, 
  name, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  helpText,
  required = false,
  disabled = false,
  className = '',
  validation = null,
  validateOnBlur = true,
  validateOnChange = false,
  showValidIcon = true
}) => {
  const [localError, setLocalError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);

  const validateField = useCallback((fieldValue) => {
    if (!validation) return '';
    
    if (required && (!fieldValue || fieldValue.trim() === '')) {
      return `${label || 'Field'} is required`;
    }
    
    if (validation.pattern && !validation.pattern.test(fieldValue)) {
      return validation.message || 'Invalid format';
    }
    
    if (validation.minLength && fieldValue.length < validation.minLength) {
      return `Minimum ${validation.minLength} characters required`;
    }
    
    if (validation.maxLength && fieldValue.length > validation.maxLength) {
      return `Maximum ${validation.maxLength} characters allowed`;
    }
    
    if (validation.custom && typeof validation.custom === 'function') {
      return validation.custom(fieldValue);
    }
    
    return '';
  }, [validation, required, label]);

  useEffect(() => {
    if (touched && validateOnChange) {
      const validationError = validateField(value);
      setLocalError(validationError);
      setIsValid(!validationError && value);
    }
  }, [value, touched, validateOnChange, validateField]);

  const handleBlur = () => {
    setTouched(true);
    if (validateOnBlur) {
      const validationError = validateField(value);
      setLocalError(validationError);
      setIsValid(!validationError && value);
    }
  };

  const handleChange = (e) => {
    onChange(e);
    if (validateOnChange && touched) {
      const validationError = validateField(e.target.value);
      setLocalError(validationError);
      setIsValid(!validationError && e.target.value);
    }
  };

  const displayError = error || localError;
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!displayError}
          required={required}
          disabled={disabled}
          className={showValidIcon && isValid && touched ? 'pr-10' : ''}
        />
        
        {/* Validation Icons */}
        {showValidIcon && touched && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {displayError ? (
              <Icon name="exclamationCircle" className="h-5 w-5 text-red-500" />
            ) : isValid ? (
              <Icon name="checkCircle" className="h-5 w-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>
      
      {displayError && (
        <p className="text-sm text-red-600 flex items-center" role="alert">
          <Icon name="exclamationTriangle" className="h-4 w-4 mr-1" />
          {displayError}
        </p>
      )}
      
      {helpText && !displayError && (
        <p className="text-sm text-gray-500 flex items-center">
          <Icon name="informationCircle" className="h-4 w-4 mr-1" />
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;
FormField.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  helpText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  validation: PropTypes.shape({
    pattern: PropTypes.instanceOf(RegExp),
    message: PropTypes.string,
    minLength: PropTypes.number,
    maxLength: PropTypes.number,
    custom: PropTypes.func
  }),
  validateOnBlur: PropTypes.bool,
  validateOnChange: PropTypes.bool,
  showValidIcon: PropTypes.bool
};