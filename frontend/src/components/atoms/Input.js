import React from 'react';

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  disabled = false,
  error = false,
  className = '',
  id,
  name,
  required = false,
  ...props 
}) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm transition-colors duration-200';
  
  const stateClasses = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500';
    
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white';
  
  const inputClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`;
  
  return (
    <input
      type={type}
      id={id}
      name={name}
      className={inputClasses}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      {...props}
    />
  );
};

export default Input;