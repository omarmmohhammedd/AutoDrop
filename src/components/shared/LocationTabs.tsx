import React, { ReactNode, useMemo } from 'react';
import { Link, Location, useLocation } from 'react-router-dom';

interface RouteInterface {
  title: string;
  path: string;
}

export default function LocationTabs() {
  const routes: RouteInterface[] = [
    {
      path: '/locations',
      title: 'Countries'
    },
    {
      path: '/locations/regions',
      title: 'Regions'
    },
    {
      path: '/locations/cities',
      title: 'Cities'
    },
    {
      path: '/locations/districts',
      title: 'Districts'
    }
  ];
  const { pathname }: Location = useLocation();
  console.log(pathname, routes);

  return (
    <div className="grid">
      <ul className="inline-flex gap-2 overflow-x-auto">
        {routes.map((route: RouteInterface, index: string | number) => {
          return (
            <li key={index}>
              <Link
                to={route.path}
                className={[
                  'btn-with-icon',
                  route.path === pathname ? 'bg-primary text-white' : 'outline-btn'
                ].join(' ')}
              >
                {route.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
