import { pick } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from 'src/helper/AxiosInstance';

export default function useOrderHooks() {
  let rerender = true;
  const { id } = useParams();
  const [order, setOrder] = useState<{
    order: any;
    unpaid_amount: number | undefined;
    amount_included_vat: number | undefined;
    vat_value: number | undefined;
    fixedShippingFees: number | undefined;
  }>({
    order: undefined,
    unpaid_amount: 0,
    amount_included_vat: 0,
    vat_value: 0,
    fixedShippingFees: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function GetOrder() {
    try {
      const { data } = await axiosInstance.get('orders/' + id);
      setOrder(data);
      console.log(await axiosInstance.get('orders/' + id))
    } catch (error) {}
  }

  useEffect(() => {
    if (rerender) {
      Promise.all([GetOrder()]).finally(() => {
        setIsLoading(false);
      });

      rerender = false;
    }
  }, []);
  console.log(order)
  return { order, isLoading, GetOrder };
}
