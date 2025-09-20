import React from 'react';
import PropTypes from 'prop-types';
import { validatePasswordStrength } from '../../utils/security';

const PasswordStrengthMeter = ({ password, className = '', showRequirements = true }) => {
  const validation = validatePasswordStrength(password);
  
  const getColorClasses = (strength) => {
    switch (strength) {
      case 'weak': return { bg: 'bg-red-500', text: 'text-red-600' };
      case 'medium': return { bg: 'bg-yellow-500', text: 'text-yellow-600' };
      case 'strong': return { bg: 'bg-green-500', text: 'text-green-600' };
      default: return { bg: 'bg-gray-200', text: 'text-gray-400' };
    }
  };
  
  const colors = getColorClasses(validation.strength);
  const strengthBars = validation.strength === 'weak' ? 1 : validation.strength === 'medium' ? 2 : validation.strength === 'strong' ? 4 : 0;
  
  if (!password) return null;
  
  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">Password strength:</span>
        <span className={`text-sm font-medium ${colors.text}`}>
          {validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1)} ({validation.score}%)
        </span>
      </div>
      
      {/* Strength bar */}
      <div className="flex space-x-1 mb-2">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
              level <= strengthBars ? colors.bg : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      {/* Progress bar showing exact score */}
      <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
        <div 
          className={`h-1 rounded-full transition-all duration-300 ${colors.bg}`}
          style={{ width: `${validation.score}%` }}
        />
      </div>
      
      {/* Validation message */}
      {!validation.valid && (
        <p className="text-sm text-red-600 mb-2">
          {validation.message}
        </p>
      )}
      
      {/* Requirements checklist */}
      {showRequirements && (
        <div className="text-xs text-gray-500">
          <ul className="space-y-1">
            <li className={password && password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
              {password && password.length >= 8 ? '✓' : '○'} At least 8 characters
            </li>
            <li className={password && /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
              {password && /[a-z]/.test(password) ? '✓' : '○'} Lowercase letter
            </li>
            <li className={password && /[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
              {password && /[A-Z]/.test(password) ? '✓' : '○'} Uppercase letter
            </li>
            <li className={password && /\d/.test(password) ? 'text-green-600' : 'text-gray-400'}>
              {password && /\d/.test(password) ? '✓' : '○'} Number
            </li>
            <li className={password && /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
              {password && /[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} Special character
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;Password
StrengthMeter.propTypes = {
  password: PropTypes.string,
  className: PropTypes.string,
  showRequirements: PropTypes.bool
};