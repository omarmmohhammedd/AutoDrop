import React, { ReactNode } from 'react';

export default function AuthWrapper({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 p-6 bg-white">{children}</div>
  );
}
