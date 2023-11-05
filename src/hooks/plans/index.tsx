import { pick } from 'lodash';
import React, { useEffect, useState } from 'react';
import axiosInstance from 'src/helper/AxiosInstance';

export default function usePlansHooks() {
  let rerender = true;
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<any>({
    search_key: '',
    page: 1
  });

  async function GetItems(params?: any) {
    try {
      const paginate = pick({ ...pagination, ...params }, ['page', 'search_key']);

      const { data } = await axiosInstance.get('plans', {
        params: paginate
      });
      setPlans(data.data);
      setPagination((ev: any) => ({
        ...ev,
        ...data.pagination
      }));
    } catch (error) {}
  }

  useEffect(() => {
    if (rerender) {
      Promise.all([GetItems()]).finally(() => {
        setIsLoading(false);
      });

      console.log(isLoading);

      rerender = false;
    }
  }, []);

  return { plans, isLoading, pagination, GetItems };
}
