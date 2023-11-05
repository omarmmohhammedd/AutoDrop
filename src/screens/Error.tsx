import React from 'react';
import { Icon } from '@iconify/react';

export default function Error() {
  return (
    <div className="p-8">
      <div className="w-full flex flex-col gap-6 items-center justify-center max-w-screen-md mx-auto">
        <div className="p-6 rounded-full bg-slate-100 flex items-center justify-center">
          <Icon
            icon="fluent:plug-disconnected-24-regular"
            width={100}
            height={100}
          />
        </div>
        <div className="space-y-4">
          <p className="text-center font-bold text-6xl text-slate-800">404</p>
          <p className="text-center font-medium text-base text-slate-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis quaerat autem
            repellat dolores et fuga harum libero, ad commodi consequuntur officiis debitis pariatur
            ducimus eligendi repudiandae, dolorum expedita sequi quibusdam.
          </p>
        </div>
      </div>
    </div>
  );
}
