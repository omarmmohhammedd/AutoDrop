import React, { AllHTMLAttributes } from 'react';

function Image({
  src,
  placeholder = '/images/placeholder.png',
  ...props
}: AllHTMLAttributes<HTMLImageElement> & { placeholder?: string; src?: string }) {
  return (
    <img
      src={src || placeholder}
      alt="Image"
      onError={(e) => ((e.target as HTMLImageElement).src = placeholder)}
      title="Image"
      loading="lazy"
      {...props}
    />
  );
}

export default Image;
