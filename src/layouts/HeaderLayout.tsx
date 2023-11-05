import React, { cloneElement, useCallback, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from 'react-router-dom';
import SideBar from './SideBar';
import { titles } from '../helper/PageTitles';
import Alert from 'src/components/shared/Alert';
import ContactForm from 'src/components/shared/ContactForm';
import AuthFooter from 'src/components/shared/AuthFooter';

const HeaderLayout: React.FC<{ children: any }> = ({ children }): JSX.Element => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState<boolean>(false);

  const handleMenu = useCallback(function () {
    document.querySelector('[data-type="menu"]')?.classList.remove('hidden');
  }, []);

  return (
    <React.Fragment>
      <div
        className="flex min-h-screen"
        data-type="body"
      >
        <SideBar />

        <main
          className="flex-1 shrink-0 min-h-fit flex flex-col"
          data-type="content"
        >
          <header className="bg-white w-full sticky top-0 z-10 print:hidden">
            <div className="flex items-center gap-4 py-6 px-4 lg:px-8">
              <button
                className="btn-with-icon !text-neutral-500 lg:hidden"
                onClick={handleMenu}
              >
                <Icon
                  icon="heroicons-solid:menu"
                  width={22}
                />
              </button>
              <div className="flex-1 grid">
                <p
                  className="font-bold text-neutral-800 text-2xl"
                  data-type="page-title"
                >
                  {titles[pathname] || ''}
                </p>
              </div>
            </div>
          </header>
          <div className="flex-1 pt-2 relative">{children}</div>
          <AuthFooter />
        </main>
      </div>
    </React.Fragment>
  );
};

export default HeaderLayout;
