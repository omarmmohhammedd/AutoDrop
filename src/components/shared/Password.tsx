import { Icon } from '@iconify/react';
import React, { HTMLAttributes, useRef, useMemo, InputHTMLAttributes, useState } from 'react';

export default function Password(props: InputHTMLAttributes<HTMLInputElement>) {
  const [type, setType] = useState<InputHTMLAttributes<HTMLInputElement>['type']>('password');

  const Button = useMemo(() => {
    return (
      <button
        className="w-10 h-full flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-0 appearance-none text-neutral-600"
        type="button"
        onClick={() => {
          if (type === 'password') {
            setType('text');
          } else {
            setType('password');
          }
        }}
      >
        <Icon
          icon={type === 'password' ? 'ri:eye-line' : 'ri:eye-off-line'}
          width={18}
        />
      </button>
    );
  }, [type]);

  return (
    <div className="relative">
      <input
        type={type}
        className={[props.className, '!pr-12'].join(' ')}
        {...props}
      />
      {Button}
    </div>
  );
}
