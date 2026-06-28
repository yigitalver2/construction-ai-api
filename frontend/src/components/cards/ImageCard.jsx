import React from 'react';
import './ImageCard.css';

const ImageCard = ({ 
  image, 
  onSelect, 
  isSelected = false,
  onClick 
}) => {
  const {
    thumbnail_url,
    category,
    uploaded_at,
    status,
    description
  } = image;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={`image-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {onSelect && (
        <div 
          className="image-card-checkbox"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(image);
          }}
        >
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => {}}
          />
        </div>
      )}
      
      <div className="image-card-thumbnail">
        <img src={thumbnail_url} alt={description || 'Site photo'} />
      </div>
      
      <div className="image-card-content">
        {status && (
          <span className={`image-card-status status-${status}`}>
            {status}
          </span>
        )}
        {category && (
          <span className="image-card-category">{category}</span>
        )}
        <p className="image-card-date">{formatDate(uploaded_at)}</p>
        {description && (
          <p className="image-card-description">{description}</p>
        )}
      </div>
    </div>
  );
};

export default ImageCard;
