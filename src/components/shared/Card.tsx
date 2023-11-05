import React, { HTMLAttributes } from 'react';

export default function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: any }) {
  return (
    <div
      className={[
        'border border-gray-200 rounded-2xl p-5 bg-white shadow-2xl shadow-gray-800/[0.01] relative overflow-hidden',
        className
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
