import React from 'react';
import './Alert.css';

function Alert({ 
  children, 
  variant = 'info', 
  onClose,
  className = '',
  ...props 
}) {
  return (
    <div className={`alert alert-${variant} ${className}`} {...props}>
      <div className="alert-content">{children}</div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
}

export default Alert;
