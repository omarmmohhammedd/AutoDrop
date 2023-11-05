import { Popover } from '@headlessui/react';
import { Icon } from '@iconify/react';
import React, { ReactNode } from 'react';

type Position = 'TOP' | 'BOTTOM' | 'RIGHT' | 'LEFT';

export default function Dropdown({
  children,
  btnTitle,
  btnIcon,
  position = 'RIGHT'
}: {
  children: ReactNode;
  btnTitle?: string;
  btnIcon?: string;
  position?: Position;
}) {
  const positions: Record<Position, string> = {
    TOP: 'right-0 rtl:right-auto rtl:left-0 left-[calc(100%+0.5rem)]',
    BOTTOM: 'right-0 rtl:right-auto rtl:left-0 top-[calc(100%+0.5rem)]',
    RIGHT: 'right-[calc(100%+0.5rem)] rtl:right-auto rtl:left-[calc(100%+0.5rem)] top-0',
    LEFT: 'left-[calc(100%+0.5rem)] rtl:left-auto rtl:right-[calc(100%+0.5rem)] top-0'
  };

  return (
    <Popover className="relative">
      <Popover.Button className="btn-with-icon outline-btn !text-neutral-600 shrink-0">
        <Icon
          icon={btnIcon || 'bx:dots-horizontal-rounded'}
          width={18}
        />
        {btnTitle ? <span>{btnTitle}</span> : null}
      </Popover.Button>

      <Popover.Panel
        className={[
          'absolute z-10 ring-1 ring-ring-border bg-white rounded-lg w-max',
          positions[position]
        ].join(' ')}
      >
        <ul className="divide-y divide-ring-border">{children}</ul>
      </Popover.Panel>
    </Popover>
  );
}
