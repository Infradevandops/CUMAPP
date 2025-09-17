import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../atoms';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        
        {/* Modal panel */}
        <div 
          className={`
            inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl 
            transform transition-all sm:my-8 sm:align-middle sm:w-full ${sizes[size]} ${className}
          `}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {title && (
                <h3 className="text-lg font-medium text-gray-900" id="modal-title">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  onClick={onClose}
                >
                  <Icon name="x" size="md" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className = '', ...props }) => (
  <div className={`px-4 py-3 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

const ModalBody = ({ children, className = '', ...props }) => (
  <div className={`px-4 py-3 ${className}`} {...props}>
    {children}
  </div>
);

const ModalFooter = ({ children, className = '', ...props }) => (
  <div className={`px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end space-x-2 ${className}`} {...props}>
    {children}
  </div>
);

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  className: PropTypes.string
};

ModalHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

ModalBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

ModalFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

// Export compound component
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;