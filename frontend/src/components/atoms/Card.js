import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg border';
  
  const variants = {
    default: 'border-gray-200',
    outlined: 'border-gray-300',
    elevated: 'border-gray-100'
  };
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const hoverEffect = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  
  const classes = `
    ${baseClasses} 
    ${variants[variant]} 
    ${paddings[padding]} 
    ${shadows[shadow]} 
    ${hoverEffect} 
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`border-b border-gray-200 pb-3 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`border-t border-gray-200 pt-3 mt-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  hover: PropTypes.bool,
  className: PropTypes.string
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

// Export compound component
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;