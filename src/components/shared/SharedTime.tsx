import { Icon } from '@iconify/react';
import React from 'react';

function SharedTime({ date }: { date: Date | string }) {
  return (
    <p
      className="inline-flex items-center gap-2 text-neutral-600 group align-middle"
      title={date?.toString()}
    >
      <Icon
        className="shrink-0 group-hover:hidden"
        icon="fluent:clock-16-regular"
        width={18}
      />
      <Icon
        className="shrink-0 hidden group-hover:!block"
        icon="fluent:clock-16-filled"
        width={18}
      />
      <span className="text-sm  font-medium shrink-0">
        {date ? new Date(date).toString().substring(0, 10) : 'N/A'}
      </span>
    </p>
  );
}

export default SharedTime;
