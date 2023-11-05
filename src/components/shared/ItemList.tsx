import React from 'react';

export default function ItemList({ className, ...props }: React.AllHTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={'first:pt-0 last:pb-0 ' + className}
      {...props}
    ></li>
  );
}
