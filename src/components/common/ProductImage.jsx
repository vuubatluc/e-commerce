import React, { useState } from 'react';
import './ProductImage.css';

const ProductImage = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  return (
    <div className="product-image-container">
      {hasError || !src ? (
        <div className="no-image-placeholder">
          <span role="img" aria-label="camera icon">📷</span>
          <p>Chưa có ảnh</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="product-image-display"
          onError={handleError}
        />
      )}
    </div>
  );
};

export default ProductImage;
