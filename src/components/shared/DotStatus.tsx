import React from 'react';

function DotStatus({ active }: { active: boolean }) {
  return (
    <p className="inline-flex gap-2 items-center">
      <span
        className={[
          'shrink-0 inline w-2 h-2 rounded-full',
          active ? 'bg-sky-500' : 'bg-red-500'
        ].join(' ')}
      ></span>
      <span className="text-sm text-neutral-600">{active ? 'Active' : 'Inactive'}</span>
    </p>
  );
}

export default DotStatus;
