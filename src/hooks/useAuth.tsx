import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redirect, RouteObject, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from 'src/helper/AxiosInstance';
import { storeToken, saveUserInfo } from 'src/reducers/auth';
import { RootState } from 'src/store';
import { authenticationRoutes, names } from 'src/helper/routes';
import SetupSocketConnection from 'src/helper/socket.io';
import { setResponse } from 'src/reducers/globalResponse';

function useAuth(): boolean {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const stored_token = token || localStorage.getItem('@token');
      await GetSettings();

      if (!stored_token) {
        dispatch(storeToken(null));
        setIsLoading(false);
        if (!/account|page|contact|pricing/gi.test(pathname)) {
          navigate('/account/login', {
            replace: true
          });
        }

        return;
      }

      await GetUserInfo(stored_token);
    })();
  }, [token]);

  async function GetSettings() {
    try {
      const { data } = await axiosInstance.get('settings');
      dispatch(setResponse(data?.settings));
    } catch (error) {
      console.log('error while getting settings :( => ', error);
    }
  }
  async function GetUserInfo(token?: string) {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('auth/profile');
      const { account, subscription } = data;
      await SetupSocketConnection(account);

      dispatch(storeToken(token));
      dispatch(saveUserInfo({ ...account, subscription }));

      if (authenticationRoutes.some((route: RouteObject) => [route.path].includes(pathname))) {
        return navigate('/', {
          replace: true
        });
      }
      navigate(pathname, {
        replace: true
      });
    } catch (error) {
      console.log(error);
      dispatch(storeToken(null));
    } finally {
      setIsLoading(false);
    }
  }

  type Types = 'permissions' | 'access';
  type UserTypes = 'super_admin' | 'admin' | 'salesman' | 'accountant';

  const GeneratePermissionPerAccess = useCallback(function (type: UserTypes) {
    let result: Record<Types, string[]> = {
      access: [],
      permissions: []
    };

    switch (type) {
      case 'super_admin':
        result = {
          permissions: names,
          access: ['show', 'edit', 'delete', 'update']
        };
        return GeneratePermissions(result.permissions, result.access);
        break;
      case 'salesman':
        result = {
          permissions: [],
          access: []
        };

        return GeneratePermissions(result.permissions, result.access);
        break;
      case 'accountant':
        result = {
          permissions: ['invoices', 'products'],
          access: ['show', 'edit', 'delete', 'update']
        };

        return GeneratePermissions(result.permissions, result.access);
        break;

      default:
        break;
    }
  }, []);

  const GeneratePermissions = useCallback(function (permissions: string[], access: string[]) {
    let result: string[] = [],
      collectPermissions: any[];

    collectPermissions = new Array().concat(
      ...permissions.map((name: string) => {
        let item: string[];

        item = access.map((access: string) => access + ' ' + name);
        return item;
      })
    );

    return collectPermissions;
  }, []);

  return isLoading;
}

export default useAuth;
