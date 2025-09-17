import React from 'react';
import Input from '../atoms/Input';

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
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        error={!!error}
        required={required}
        disabled={disabled}
      />
      
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;