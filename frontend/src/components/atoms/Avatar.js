import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className = '',
  fallbackColor = 'bg-gray-500',
  ...props 
}) => {
  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl'
  };
  
  const baseClasses = `inline-flex items-center justify-center rounded-full ${sizes[size]}`;
  
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  if (src) {
    return (
      <img
        className={`${baseClasses} object-cover ${className}`}
        src={src}
        alt={alt || name || 'Avatar'}
        {...props}
      />
    );
  }
  
  return (
    <div 
      className={`${baseClasses} ${fallbackColor} text-white font-medium ${className}`}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  className: PropTypes.string,
  fallbackColor: PropTypes.string
};

export default Avatar;