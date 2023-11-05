import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { MoveToTop } from 'src/animations';
import Table from 'src/components/shared/tables';
import { Link } from 'react-router-dom';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import SharedTime from 'src/components/shared/SharedTime';
import useOrdersHooks from 'src/hooks/orders';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';
import { AxiosError } from 'axios';
import Alert from 'src/components/shared/Alert';

export default function index() {
  let rerender: boolean = true;
  const { pagination, isLoading, orders, GetOrders } = useOrdersHooks();
  const alert = useAlert();

  async function DeleteItem(id: string) {
    try {
      const { data } = await axiosInstance.post('orders/delete', { id });
      alert.show({
        text: data?.message,
        visible: true
      });
      await GetOrders();
    } catch (error: AxiosError | any) {
      const err = error.response?.data;
      if (err) {
        const _serviceError = err?.message?.error?.message;
        alert.show({
          text: _serviceError || err?.message,
          visible: true
        });
      }
    }
  }

  const MEMO_TABLE = useMemo(() => {
    return (
      <Table
        RenderHead={() => {
          return (
            <tr>
              <th>REF NO.</th>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Items count</th>
              <th>Added date</th>
              <th>Actions</th>
            </tr>
          );
        }}
        RenderBody={() => {
          return (
            <>
              {orders.map((item: any, i: number) => (
                <tr>
                  <td>
                    <Link
                      to={'/orders/' + item?.id}
                      className="text-sky-500 font-semibold tabular-nums"
                    >
                      #{item.reference_id}
                    </Link>
                  </td>
                  <td>{item.order_id}</td>
                  <td>{[item?.customer?.first_name, item?.customer?.last_name].join(' ')}</td>

                  <td>{CurrencyFormatter(item?.amounts?.total?.amount)}</td>
                  <td>{item?.payment_method}</td>
                  <td style={item?.status === 'created' ?
                   {backgroundColor:'#f5b002',textAlign:'center'}:item?.status === 'in_review' ?
                   {backgroundColor:'#ef9b0f',color:'white',textAlign:'center'} : item?.status === 'in_progress' ?
                   {backgroundColor:'#8431c9',textAlign:'center'} :item?.status === 'in_transit' ?
                   {backgroundColor:'#8431c9',textAlign:'center'} : item?.status === 'finished' ? 
                   {backgroundColor:'#21e758',textAlign:'center'} : {backgroundColor:'#f72300',color:'white',textAlign:'center'}}>{item?.status === 'created' ?
                   'Created':item?.status === 'in_review' ?
                    'In Review' : item?.status === 'in_progress' ?
                     'In Progress' :item?.status === 'in_transit' ?
                      'Delivering' : item?.status === 'finished' ? 
                    'Completed ' : 'Canceled' }</td>
                  <td>{item?.items?.length}</td>
                  <td>
                    <SharedTime date={item?.createdAt} />
                  </td>
                  <td>
                    <div className="inline-flex gap-2">
                      <Link
                        to={'/orders/' + item?.id}
                        className="btn-with-icon outline-btn text-content w-fit"
                      >
                        <Icon
                          icon="ri:eye-line"
                          width={15}
                          height={15}
                        />
                      </Link>
                      {/* <button
                        className="btn-with-icon bg-red-500"
                        onClick={() => DeleteItem(item?.id)}
                      >
                        <span>Delete</span>
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </>
          );
        }}
        title={'Orders table'}
        isEmpty={!orders?.length}
        pagination={pagination}
        searchProps={{
          defaultValue: pagination.search_key,
          onKeyDown: ({ key, target }: any) => {
            if (key === 'Enter') {
              GetOrders({
                search_key: target.value
              });
            }
          }
        }}
        onNextClick={() => GetOrders({ page: pagination.page + 1 })}
        onPreviousClick={() => GetOrders({ page: pagination.page - 1 })}
        loading={isLoading}
      />
    );
  }, [pagination, isLoading, orders]);

  return (
    <div className="p-8 pt-2 space-y-4">
      <Alert
        title="Welcome dear"
        content="The order price includes the commission for the platform, as shown with each request, the percentage of the platform, after adding your price"
        type="warn"
      />

      {MEMO_TABLE}
    </div>
  );
}
