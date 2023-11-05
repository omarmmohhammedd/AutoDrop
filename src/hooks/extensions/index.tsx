import { pick } from 'lodash';
import { useEffect, useState } from 'react';
import axiosInstance from 'src/helper/AxiosInstance';

export default function useExtensionHooks() {
  let rerender = true;
  const [extensions, setExtensions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<any>({
    search_key: '',
    page: 1
  });

  async function getExtensions(params?: any) {
    try {
      const paginate = pick({ ...pagination, ...params }, ['page', 'search_key']);

      const { data } = await axiosInstance.get('extensions/all', {
        params: paginate
      });
      const _extensions = data.result?.extensions?.data;
      const _pagination = data.result?.extensions?.pagination;
      setExtensions(() => _extensions);
      setPagination((ev: any) => ({
        ...ev,
        ..._pagination
      }));
    } catch (error) {}
  }

  useEffect(() => {
    if (rerender) {
      Promise.all([getExtensions()]).finally(() => {
        setIsLoading(false);
      });

      rerender = false;
    }
  }, []);

  return { extensions, isLoading, pagination, getExtensions };
}
