import { pick } from 'lodash';
import React, { useEffect, useState } from 'react';
import axiosInstance from 'src/helper/AxiosInstance';

export default function useUsersHooks() {
  let rerender = true;
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<any>({
    search_key: '',
    page: 1
  });

  async function GetUsers(params?: any) {
    try {
      const paginate = pick({ ...pagination, ...params }, ['page', 'search_key']);

      const { data } = await axiosInstance.get('auth/users', {
        params: paginate
      });
      setUsers(data.data);
      setPagination((ev: any) => ({
        ...ev,
        ...data.pagination
      }));
    } catch (error) {}
  }

  useEffect(() => {
    if (rerender) {
      Promise.all([GetUsers()]).finally(() => {
        setIsLoading(false);
      });

      console.log(isLoading);

      rerender = false;
    }
  }, []);

  return { users, isLoading, pagination, GetUsers };
}
