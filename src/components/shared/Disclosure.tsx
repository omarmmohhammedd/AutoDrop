import React, { ReactNode } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Icon } from '@iconify/react';

export default function DisclosureShared({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <Disclosure
      className="bg-white rounded-lg border border-gray-200 py-4 px-6 shadow-2xl shadow-gray-800/[0.01]"
      as="div"
    >
      <Disclosure.Button className="text-base font-semibold text-title">{title}</Disclosure.Button>

      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform translate-y-4 opacity-0"
        enterTo="transform translate-y-0 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform translate-y-0 opacity-100"
        leaveTo="transform translate-y-4 opacity-0"
      >
        <Disclosure.Panel
          as="div"
          className="mt-3"
        >
          {children}
        </Disclosure.Panel>
      </Transition>
    </Disclosure>
  );
}
