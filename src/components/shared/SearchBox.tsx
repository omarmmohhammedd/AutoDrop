import { Icon } from '@iconify/react';
import { AllHTMLAttributes } from 'react';

export default function SearchBox({ className, ...rest }: AllHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="w-full bg-neutral-50 flex items-center ps-3 rounded-lg border border-neutral-200">
      <span className="shrink-0 inline text-neutral-500">
        <Icon
          icon="ri:search-line"
          width={20}
        />
      </span>
      <input
        type="text"
        className={'form-input !bg-transparent text-sm border-none p-3 ' + className}
        placeholder="What are you looking for?"
        autoComplete="off"
        {...rest}
      />
    </div>
  );
}
