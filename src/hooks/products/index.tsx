import { pick } from 'lodash';
import React, { useEffect, useState } from 'react';
import axiosInstance from 'src/helper/AxiosInstance';

export default function useProductsHooks() {
  let rerender = true;
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<any>({
    search_key: '',
    page: 1
  });
  const [users, setUsers] = useState<any[]>([]);

  async function GetProducts(params?: any) {
    try {
      const paginate = pick({ ...pagination, ...params }, [
        'page',
        'search_key',
        'vendor',
        'min_price',
        'max_price'
      ]);

      const { data } = await axiosInstance.get('products/v1/all', {
        params: paginate
      });
      setProducts(data.data);
      setPagination((ev: any) => ({
        ...ev,
        ...data.pagination
      }));
    } catch (error) {}
  }

  async function GetUsers() {
    try {
      const { data } = await axiosInstance.get('auth/users', { params: { userType: 'vendor' } });
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (rerender) {
      Promise.all([GetProducts(), GetUsers()]).finally(() => {
        setIsLoading(false);
      });

      console.log(isLoading);

      rerender = false;
    }
  }, []);

  return { products, isLoading, pagination, GetProducts, users };
}
