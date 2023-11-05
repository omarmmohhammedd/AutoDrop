import React from 'react';
import { Icon } from '@iconify/react';

export default function EmptyCard({
  icon,
  size = 30,
  title,
  content
}: {
  icon: string;
  size?: number;
  title: string;
  content: string;
}) {
  return (
    <div>
      <div className="w-full flex flex-col gap-4 items-center justify-center">
        <div className="p-4 rounded-full bg-slate-100 flex items-center justify-center">
          <Icon
            icon={icon}
            width={size}
            height={size}
          />
        </div>
        <div className="space-y-2">
          <p className="text-center font-semibold text-lg text-slate-800">{title}</p>
          <p className="text-center font-medium text-sm text-slate-500">{content}</p>
        </div>
      </div>
    </div>
  );
}
