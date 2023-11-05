import { pick } from 'lodash';
import React, { useEffect, useState } from 'react';
import axiosInstance from 'src/helper/AxiosInstance';

export default function useOrdersHooks() {
  let rerender = true;
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<any>({
    search_key: '',
    page: 1
  });

  async function GetOrders(params?: any) {
    try {
      const paginate = pick({ ...pagination, ...params }, ['page', 'search_key']);

      const { data } = await axiosInstance.get('orders/all', {
        params: paginate
      });
      setOrders(data.data);
      setPagination((ev: any) => ({
        ...ev,
        ...data.pagination
      }));
    } catch (error) {}
  }

  useEffect(() => {
    if (rerender) {
      Promise.all([GetOrders()]).finally(() => {
        setIsLoading(false);
      });

      console.log(isLoading);

      rerender = false;
    }
  }, []);

  return { orders, isLoading, pagination, GetOrders };
}
