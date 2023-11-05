import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { MoveToTop } from 'src/animations';
import Table from 'src/components/shared/tables';
import { Link } from 'react-router-dom';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import SharedTime from 'src/components/shared/SharedTime';
import Image from 'src/components/shared/Image';
import { ConfirmAlert, useAlert } from 'src/hooks/alerts';
import { AxiosError } from 'axios';
import axiosInstance from 'src/helper/AxiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import useSubscriptionsHooks from 'src/hooks/subscriptions';
import Modal from 'src/components/shared/Modal';

export default function index() {
  let rerender: boolean = true;
  const { pagination, isLoading, subscriptions, GetItems } = useSubscriptionsHooks();
  const alert = useAlert();

  async function DeleteItem(id: string) {
    try {
      const { data } = await axiosInstance.post('subscriptions/v1/delete', { id });
      alert.show({
        text: data?.message,
        visible: true
      });
      await GetItems();
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
              <th>User</th>
              <th>Plan name</th>
              <th>Plan price</th>
              <th>Orders limit</th>
              <th>Products limit</th>
              <th>Start date</th>
              <th>Expire date</th>
              <th>Added date</th>
              <th>Upgraded date</th>
              <th>Actions</th>
            </tr>
          );
        }}
        RenderBody={() => {
          return (
            <>
              {subscriptions.map((item, i) => {
                return (
                  <DisplayTableItem
                    item={item}
                    DeleteItem={DeleteItem}
                  />
                );
              })}
            </>
          );
        }}
        title={'Subscriptions table'}
        isEmpty={!subscriptions?.length}
        pagination={pagination}
        searchProps={{
          defaultValue: pagination.search_key,
          onKeyDown: ({ key, target }: any) => {
            if (key === 'Enter') {
              GetItems({
                search_key: target.value
              });
            }
          }
        }}
        onNextClick={() => pagination.page + 1}
        onPreviousClick={() => pagination.page - 1}
        loading={isLoading}
      />
    );
  }, [pagination, isLoading, subscriptions]);

  return <div className="p-8 pt-2 space-y-4">{MEMO_TABLE}</div>;
}

function DisplayTableItem({ item, DeleteItem }: any) {
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const alert = useAlert();
  const [result, setResult] = useState<any>({});

  async function GetTransactions() {
    try {
      setDisabled(true);
      const { data } = await axiosInstance.post('plans/transactions/' + item.user.id, {
        plan: item?.plan?.id
      });
      setResult({
        ...item,
        transactions: data
      });
      setVisible(true);
    } catch (error: AxiosError | any) {
      alert.show({
        text: error?.response?.data?.message,
        visible: true
      });
    } finally {
      setDisabled(false);
    }
  }

  return (
    <>
      <tr>
        <td>
          <div className="inline-flex gap-4 items-start w-screen max-w-xs">
            <Image
              src={item?.user?.avatar}
              className="w-12 h-12 rounded-lg object-cover border border-ring-border shrink-0"
            />
            <div className="flex-1 space-y-1">
              <p className="text-sm text-sky-500 !whitespace-normal line-clamp-2">
                {item?.user?.name || 'N/A'}
              </p>
              <p className="text-sm text-sub-content !whitespace-normal line-clamp-1">
                {item?.user?.email}
              </p>
            </div>
          </div>
        </td>
        <td>{item?.plan?.name || 'N/A'}</td>
        <td>{CurrencyFormatter(item?.plan?.price || 0)}</td>
        <td>
          {item?.orders_limit >= 0
            ? item?.orders_limit + '/' + item?.plan?.orders_limit
            : 'UNLIMITED'}
        </td>
        <td>
          {item?.products_limit >= 0
            ? item?.products_limit + '/' + item?.plan?.products_limit
            : 'UNLIMITED'}
        </td>
        <td>
          <SharedTime date={item.start_date} />
        </td>
        <td>
          <SharedTime date={item.expiry_date} />
        </td>
        <td>
          <SharedTime date={item.createdAt} />
        </td>
        <td>
          <SharedTime date={item.updatedAt} />
        </td>
        <td>
          <div className="inline-flex gap-2">
            <button
              className="btn-with-icon outline-btn text-content w-fit"
              onClick={GetTransactions}
              disabled={disabled}
            >
              <Icon
                icon="ri:eye-line"
                width={15}
                height={15}
              />
            </button>
            {/* <Link
            to={'/subscriptions/' + item.id}
            className="btn-with-icon outline-btn text-content w-fit"
          >
            <Icon
              icon="ri:eye-line"
              width={15}
              height={15}
            />
          </Link>
          */}
            {/* <button
            className="btn-with-icon bg-red-500"
            onClick={() => setDeleteConfirm(true)}
          >
            <span>Delete</span>
          </button> */}
          </div>
        </td>
        <ConfirmAlert
          visible={deleteConfirm}
          requestClose={() => setDeleteConfirm(false)}
          handleConfirm={async function () {
            await DeleteItem(item.id);
            setDeleteConfirm(false);
          }}
        />
      </tr>

      <Modal
        title={result?.user?.name}
        visible={visible}
        handleClose={() => setVisible(false)}
      >
        <>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Transactions</p>
            <ul className="space-y-2">
              {result?.transactions?.map((transaction: any, index: number) => (
                <li
                  className="py-3 px-4 rounded-lg bg-gray-50"
                  key={index}
                >
                  <div className="flex items-end gap-4">
                    <div className="space-y-1 flex-1 shrink-0">
                      <p className="text-sm text-title font-semibold">{transaction?.plan?.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {transaction?.plan?.description}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm text-title font-semibold">
                      {CurrencyFormatter(transaction?.amount)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      </Modal>
    </>
  );
}
