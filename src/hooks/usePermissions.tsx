import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { routes } from 'src/helper/routes';
import { RootState } from 'src/store';

type Permissions = 'admin' | 'vendor';

const permissions: Record<Permissions, string[]> = {
  admin: [
    'dashboard',
    'products',
    'users',
    'settings',
    'subscriptions',
    'plans',
    'orders',
    'server',
    'website'
  ],
  vendor: ['dashboard', 'products', 'billings', 'settings', 'orders']
};

export default function usePermissions() {
  const { user } = useSelector((state: RootState) => state.auth);

  const filterRoutes = useMemo(() => {
    const userType: Permissions = user?.userType;

    return routes.filter((route) => {
      return (
        route.path == '*' ||
        !route.permission ||
        route.permission?.some((ev: string) => permissions[userType]?.includes(ev))
      );
    });
  }, [routes, user]);

  return { filterRoutes };
}
