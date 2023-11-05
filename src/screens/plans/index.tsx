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
import Modal from 'src/components/shared/Modal';
import usePlansHooks from 'src/hooks/plans';

export default function index() {
  let rerender: boolean = true;
  const { pagination, isLoading, plans, GetItems } = usePlansHooks();
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
              <th>Name</th>
              <th>Type</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Discount type</th>
              <th>Orders limit</th>
              <th>Products limit</th>
              <th>Added date</th>
              <th>Latest update</th>
              <th>Actions</th>
            </tr>
          );
        }}
        RenderBody={() => {
          return (
            <>
              {plans.map((item, i) => {
                return (
                  <DisplayTableItem
                    item={item}
                    DeleteItem={DeleteItem}
                    refresh={GetItems}
                  />
                );
              })}
            </>
          );
        }}
        title={'Plans table'}
        isEmpty={!plans?.length}
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
  }, [pagination, isLoading, plans]);

  return (
    <div className="p-8 pt-2 space-y-4">
      <div>
        <div className="table-actions">
          <Link
            to="/plans/create"
            className="btn-with-icon outline-btn !text-content !text-sm"
          >
            <Icon
              icon="material-symbols:add-rounded"
              width={15}
              height={15}
            />
            <span>Add new plan</span>
          </Link>
        </div>
      </div>
      {MEMO_TABLE}
    </div>
  );
}

function DisplayTableItem({ item, DeleteItem, refresh }: any) {
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const alert = useAlert();
  const [result, setResult] = useState<any>({});

  return (
    <>
      <tr>
        <td>{item.name || 'N/A'}</td>
        <td>{item.is_monthly ? 'Monthly' : 'Yearly'}</td>
        <td>
          {!item.is_default ? (
            <>
              <span className={item.discount_value > 0 ? 'text-red-500 line-through' : ''}>
                {CurrencyFormatter(item?.price)}
              </span>{' '}
              {item.discount_value > 0 ? (
                <span>{CurrencyFormatter((item?.price || 0) - item?.discount_price || 0)}</span>
              ) : null}
            </>
          ) : (
            'Default plan'
          )}
        </td>
        <td>
          {!item.is_default ? (
            <>
              {item.discount_type === 'percentage'
                ? parseFloat(Number(item?.discount_value || 0).toFixed(2))
                : CurrencyFormatter(parseFloat(Number(item?.discount_value || 0).toFixed(2)))}{' '}
              {item.discount_type === 'percentage' ? '%' : null}
            </>
          ) : (
            'Default plan'
          )}
        </td>
        <td>{!item.is_default ? <>{item.discount_type}</> : 'Default plan'}</td>
        <td>{item?.orders_limit >= 0 ? item?.orders_limit : 'UNLIMITED'}</td>
        <td>{item?.products_limit >= 0 ? item?.products_limit : 'UNLIMITED'}</td>

        <td>
          <SharedTime date={item.createdAt} />
        </td>
        <td>
          <SharedTime date={item.updatedAt} />
        </td>
        <td>
          <div className="inline-flex gap-2">
            {/* <button
              className="btn-with-icon outline-btn text-content w-fit"
              onClick={GetTransactions}
              disabled={disabled}
            >
              <Icon
                icon="ri:eye-line"
                width={15}
                height={15}
              />
            </button> */}
            <Link
              to={'/plans/' + item.id}
              className="btn-with-icon outline-btn text-content w-fit"
            >
              <Icon
                icon="ri:eye-line"
                width={15}
                height={15}
              />
            </Link>
            <DeleteButton
              id={item.id}
              refresh={refresh}
            />
            {/* <button
            className="btn-with-icon bg-red-500"
            onClick={() => setDeleteConfirm(true)}
          >
            <span>Delete</span>
          </button> */}
          </div>
        </td>
      </tr>
    </>
  );
}

function DeleteButton({ id, refresh }: { id: string; refresh: any }) {
  const alert = useAlert();
  const [deleteDisabled, setDeleteDisabled] = useState<boolean>(false);
  async function DeletePlan() {
    try {
      setDeleteDisabled(true);
      const { data } = await axiosInstance.post('plans/delete/' + id);
      alert.show({ text: data.message, visible: true });
      await refresh();
    } catch (error: AxiosError | any) {
      const message = error?.response?.data?.message;
      alert.show({ text: message, visible: true });
    } finally {
      setDeleteDisabled(false);
    }
  }

  return (
    <button
      type="button"
      className="btn-with-icon !bg-red-100 !text-red-500 !text-sm"
      onClick={DeletePlan}
      disabled={deleteDisabled}
    >
      <Icon
        icon="uil:trash-alt"
        width={15}
        height={15}
      />
      <span>Delete</span>
    </button>
  );
}
