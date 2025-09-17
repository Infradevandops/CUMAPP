import React from 'react';

const PasswordStrengthMeter = ({ password, className = '' }) => {
  const calculateStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password)
    };
    
    // Calculate score based on criteria met
    Object.values(checks).forEach(check => {
      if (check) score++;
    });
    
    // Determine strength level
    if (score === 0) return { score: 0, label: '', color: '' };
    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  };
  
  const strength = calculateStrength(password);
  
  if (!password) return null;
  
  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">Password strength:</span>
        <span className={`text-sm font-medium ${
          strength.score === 1 ? 'text-red-600' :
          strength.score === 2 ? 'text-yellow-600' :
          strength.score === 3 ? 'text-blue-600' :
          strength.score === 4 ? 'text-green-600' : 'text-gray-400'
        }`}>
          {strength.label}
        </span>
      </div>
      
      <div className="flex space-x-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full ${
              level <= strength.score ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        <ul className="space-y-1">
          <li className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
            ✓ At least 8 characters
          </li>
          <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            ✓ Lowercase letter
          </li>
          <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            ✓ Uppercase letter
          </li>
          <li className={/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            ✓ Number
          </li>
          <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            ✓ Special character
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;