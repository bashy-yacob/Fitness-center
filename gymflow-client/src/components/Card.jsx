// src/components/Card.jsx
import React from 'react';
import './card-styles.css'; // <-- הנה השינוי! התאמנו את זה לשם הקובץ החדש

const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {title && <h2>{title}</h2>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;