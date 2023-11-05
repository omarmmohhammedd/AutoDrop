import React, { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { titles } from 'src/helper/PageTitles';

export default function useTitle() {
  const { pathname } = useLocation();
  const [currentTitle, setCurrentTitle] = useState<string | undefined>();

  useLayoutEffect(() => {
    document.title = titles[pathname] ?? 'Bray';
  }, [pathname]);

  function updateTitle({ title }: { title?: string }) {
    let str: string | undefined = title || 'Bray';
    document.title = str;
    const el = document.querySelector('[data-type="page-title"]') as HTMLParagraphElement;
    el.innerHTML = str;
    setCurrentTitle(title);
  }

  return { updateTitle, currentTitle };
}
