import React from 'react';
import PropTypes from 'prop-types';

const Typography = ({ 
  variant = 'body1', 
  children, 
  className = '',
  color = 'text-gray-900',
  align = 'left',
  component,
  ...props 
}) => {
  const variants = {
    h1: 'text-4xl font-bold leading-tight',
    h2: 'text-3xl font-bold leading-tight',
    h3: 'text-2xl font-semibold leading-tight',
    h4: 'text-xl font-semibold leading-tight',
    h5: 'text-lg font-medium leading-tight',
    h6: 'text-base font-medium leading-tight',
    subtitle1: 'text-lg font-normal leading-relaxed',
    subtitle2: 'text-base font-normal leading-relaxed',
    body1: 'text-base font-normal leading-normal',
    body2: 'text-sm font-normal leading-normal',
    caption: 'text-xs font-normal leading-normal',
    overline: 'text-xs font-medium uppercase tracking-wide'
  };
  
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };
  
  // Default HTML elements for each variant
  const defaultComponents = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle1: 'h6',
    subtitle2: 'h6',
    body1: 'p',
    body2: 'p',
    caption: 'span',
    overline: 'span'
  };
  
  const Component = component || defaultComponents[variant] || 'p';
  const classes = `${variants[variant]} ${color} ${alignments[align]} ${className}`;
  
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

Typography.propTypes = {
  variant: PropTypes.oneOf([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'subtitle1', 'subtitle2', 'body1', 'body2',
    'caption', 'overline'
  ]),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  color: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
  component: PropTypes.elementType
};

export default Typography;