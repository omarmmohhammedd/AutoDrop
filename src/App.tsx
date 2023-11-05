import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux/es/exports';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  RouteObject,
  redirect,
  useLocation,
  Location,
  Navigate
} from 'react-router-dom';
import LoadingComponent from './components/shared/LoadingComponent';
import { routes, authenticationRoutes } from './helper/routes';
import ScrollToTop from './hooks/ScrollToTop';
import useAuth from './hooks/useAuth';
import HeaderLayout from './layouts/HeaderLayout';
import { storeToken } from './reducers/auth';

import { RootState } from './store';
import usePermissions from './hooks/usePermissions';
import AuthFooter from './components/shared/AuthFooter';

function AppWrapper() {
  const isLoading = useAuth();
  const { token } = useSelector((state: RootState) => state.auth);
  const { filterRoutes } = usePermissions();
  const { pathname } = useLocation();

  if (isLoading) return <LoadingComponent />;

  return (
    <Fragment>
      {token ? (
        <HeaderLayout>
          <Routes>
            {filterRoutes.map((route: any, index: string | number) => (
              <Route
                key={index}
                element={route.element}
                path={route.path}
              ></Route>
            ))}
          </Routes>
        </HeaderLayout>
      ) : (
        <Fragment>
          <div className="flex min-h-screen flex-col">
            {!/login/gi.test(pathname) ? (
              <div className="p-8">
                <img
                  src="/images/logos/2.png"
                  alt="website logo"
                  className="w-full max-w-[6rem] mx-auto block"
                />
              </div>
            ) : null}
            <div className="flex-1 grid">
              <Routes>
                {authenticationRoutes.map((route: any, index: string | number) => (
                  <Route
                    key={index}
                    {...route}
                  ></Route>
                ))}
              </Routes>
            </div>
            <AuthFooter />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
      <ScrollToTop />
    </Router>
  );
}

export default App;

