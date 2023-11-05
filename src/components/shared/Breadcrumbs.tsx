import { Icon } from '@iconify/react';
import React, { ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Breadcrumbs({ title, path }: { title?: string; path?: string }) {
  const navigate = useNavigate();

  const handleNavigateClick = useCallback(() => {
    if (path) {
      return navigate(path, { replace: true });
    }
    navigate(-1);
  }, []);

  return (
    <div>
      <div className="inline-flex items-center gap-4">
        <button
          className="shrink-0 btn-with-icon !text-neutral-600 !px-0"
          type="button"
          title="navigate button"
          onClick={handleNavigateClick}
        >
          <Icon
            icon="ph:arrow-left-bold"
            width={20}
            className="rtl:hidden"
          />
          <Icon
            icon="ph:arrow-right-bold"
            width={20}
            className="hidden rtl:block"
          />
          <span className="text-lg font-semibold"> {title}</span>
        </button>
      </div>
    </div>
  );
}
