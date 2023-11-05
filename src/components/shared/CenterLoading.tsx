import { Icon } from '@iconify/react';

export default function CenterLoading() {
  return (
    <div className="fixed inset-0 w-full h-screen flex items-center justify-center p-8 bg-gray-900/20 backdrop-blur-sm z-50">
      <div className="p-6 bg-white flex items-center justify-center shrink-0 rounded-lg">
        <Icon
          icon="svg-spinners:3-dots-fade"
          width="32"
          height="32"
          className="text-gray-600"
        />
      </div>
    </div>
  );
}
