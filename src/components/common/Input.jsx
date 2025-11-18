import React from 'react';
import './Input.css';

function Input({ 
  label, 
  error, 
  helperText,
  id,
  className = '',
  containerClassName = '',
  ...props 
}) {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`input-group ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {props.required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
      {helperText && !error && <span className="input-helper-text">{helperText}</span>}
    </div>
  );
}

export default Input;
