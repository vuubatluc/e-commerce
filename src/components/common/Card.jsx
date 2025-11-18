import React from 'react';
import './Card.css';

function Card({ 
  children, 
  title, 
  className = '',
  headerActions,
  ...props 
}) {
  return (
    <div className={`card ${className}`} {...props}>
      {title && (
        <div className="card-header">
          <h2 className="card-title">{title}</h2>
          {headerActions && <div className="card-actions">{headerActions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={`card-footer ${className}`}>
      {children}
    </div>
  );
}

Card.Footer = CardFooter;

export default Card;
