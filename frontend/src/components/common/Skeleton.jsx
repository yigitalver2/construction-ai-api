import React from 'react';
import './Skeleton.css';

const Skeleton = ({ variant = 'text', width, height, className = '' }) => {
  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton;
