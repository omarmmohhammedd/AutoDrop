import { Icon } from '@iconify/react';
import React from 'react';

type Position = 'absolute' | 'fixed';
function LoadingComponent({ position = 'fixed' }: { position?: Position }) {
  const positions: Record<Position, string> = {
    absolute: 'absolute inset-0 w-full h-full',
    fixed: 'fixed inset-0 w-screen min-h-screen'
  };
  return (
    <div
      className={['bg-white flex items-center justify-center p-8', positions[position]].join(' ')}
    >
      <div className="shrink-0 flex flex-col justify-center items-center">
        <Icon
          icon="svg-spinners:3-dots-fade"
          width={50}
          className="text-primary"
        />
      </div>
    </div>
  );
}

export default LoadingComponent;
