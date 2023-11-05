import { Icon } from '@iconify/react';
import React, { DOMAttributes, FC, MutableRefObject, useCallback, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MoveToBottom, MoveToTop } from '../animations';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import Image from 'src/components/shared/Image';
import useLogout from 'src/hooks/useLogout';
import usePermissions from 'src/hooks/usePermissions';

interface RouterInterface {
  title: string;
  path: string;
  icon: string;
}

const routes: RouterInterface[] = [
  {
    title: 'Dashboard',
    icon: 'uil:apps',
    path: '/'
  },
  {
    title: 'Products',
    icon: 'ph:shopping-bag-bold',
    path: '/products'
  },
  {
    title: 'Orders',
    icon: 'ci:shopping-bag-02',
    path: '/orders'
  },
  {
    title: 'Billings and transactions',
    icon: 'fluent-emoji-high-contrast:money-bag',
    path: '/billings'
  },
  {
    title: 'Payments',
    icon: 'fluent:payment-16-regular',
    path: '/billings/payments'
  },
  {
    title: 'Plans',
    icon: 'lucide:stars',
    path: '/plans'
  },
  {
    title: 'Subscriptions',
    icon: 'fluent-emoji-high-contrast:money-bag',
    path: '/subscriptions'
  },
  {
    title: 'Users',
    icon: 'ci:users',
    path: '/users'
  },
  {
    title: 'Server keys',
    icon: 'streamline:interface-hierarchy-2-node-organization-links-structure-link-nodes-network-hierarchy',
    path: '/website/keys'
  },
  {
    title: 'Website appearance',
    icon: 'tabler:layout-kanban',
    path: '/website'
  },
  {
    title: 'Settings',
    icon: 'ri:settings-line',
    path: '/settings'
  }
];

const SideBar: FC = () => {
  const location = useLocation();
  const menuContainer = useRef<HTMLElement | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { handleLogged } = useLogout();

  const openCloseMenu = useCallback(function (ev: React.MouseEvent) {
    const currentTarget = ev.target as HTMLElement | null;
    if (currentTarget === menuContainer?.current) {
      menuContainer?.current?.classList.add('hidden');
    }
  }, []);

  const closeMenu = useCallback(function () {
    menuContainer?.current?.classList.add('hidden');
  }, []);

  const { filterRoutes } = usePermissions();

  const _filterRoutes = useMemo(() => {
    return routes.filter((route) => filterRoutes.some((ev) => ev.path === route.path));
  }, [filterRoutes]);

  const closeMenuOnMediumScreen = useMemo(() => {
    console.log('menum');
    closeMenu();
  }, [location]);

  return (
    <aside
      className="w-full lg:max-w-[18rem] shrink-0 bg-black/20 shadow-2xl shadow-black/5 fixed lg:relative z-20 hidden lg:!block print:hidden"
      ref={menuContainer}
      data-type="menu"
      onClick={openCloseMenu}
    >
      <div className="w-full max-w-[18rem] py-0 px-4 bg-primary sticky top-0 min-h-screen max-h-screen overflow-y-auto flex flex-col border-r rtl:border-r-none rtl:border-l border-white/10">
        <div className="w-full border-b border-b-white/10 flex items-start justify-between py-4">
          <Link
            to="/"
            className="shrink-0"
          >
            <img
              src="/images/logos/1.png"
              alt="website logo"
              className="w-full max-w-[5rem] mx-auto block"
            />
          </Link>
          <button
            className="shrink-0 text-white flex lg:hidden items-center justify-center"
            onClick={closeMenu}
          >
            <Icon
              icon="line-md:menu-to-close-transition"
              width={18}
            />
          </button>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {_filterRoutes.map((route: RouterInterface, index: string | number) => (
              <motion.li
                key={index}
                animate="visible"
                initial="hidden"
                variants={MoveToTop}
              >
                <Link
                  to={route.path}
                  className={[
                    'w-full flex items-center gap-3 text-base py-2 px-3 rounded ',
                    new RegExp('^' + route.path + '$', 'gi').test(location.pathname)
                      ? 'bg-secondary/10 text-secondary font-semibold'
                      : 'text-white font-medium'
                  ].join(' ')}
                >
                  <span className="shrink-0">
                    <Icon
                      icon={route.icon}
                      width={20}
                    />
                  </span>
                  <span>{route.title}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        <div className="w-full border-t border-t-white/10 flex items-center justify-between py-4 gap-4">
          <Link
            to="/settings"
            className="shrink-0 inline-flex gap-4 flex-1"
          >
            <Image
              src={user?.avatar}
              className="shrink-0 w-10 h-10 rounded-full"
            />
            <div className="flex-1 grid">
              <motion.p
                animate="visible"
                initial="hidden"
                variants={MoveToTop}
                className="text-base font-bold text-secondary truncate break-all"
              >
                {user?.name || 'UNKNOWN'}
              </motion.p>
              <div className="grid">
                <motion.a
                  animate="visible"
                  initial="hidden"
                  variants={MoveToBottom}
                  className="text-sm font-medium text-white truncate break-all"
                >
                  {user?.email || 'UNKNOWN'}
                </motion.a>
              </div>
            </div>
          </Link>
          <button
            className="shrink-0  text-white flex items-center justify-center"
            onClick={handleLogged}
          >
            <Icon
              icon="heroicons-outline:logout"
              width={24}
            />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
