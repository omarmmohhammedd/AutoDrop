import React, { useState } from 'react';
import Card from './Card';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import { RootState } from 'src/store';
import axiosInstance from 'src/helper/AxiosInstance';
import { Link } from 'react-router-dom';

export default function PlanSingleCard({ item }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [disabled, setDisabled] = useState<boolean>(false);

  console.log(user);

  async function GetPaymentPage() {
    try {
      setDisabled(true);
      if (!user.pt_customer_id) {
        await axiosInstance.post('v1/payments/enable', { id: user?.id });
      }
      const { data } = await axiosInstance.post('plans/subscribe', { id: item.id });
      // console.log(data);
      window.location.href = data.url;
      // window.open(data.url);
    } catch (error) {
      console.log(error);
    } finally {
      setDisabled(false);
    }
  }

  return (
    <Card className="space-y-2 rounded-b-lg border-b-8 border-b-secondary flex flex-col">
      <div className="flex gap-4">
        <p className="text-lg font-bold text-title flex-1">{item?.name}</p>
        {user && (
          <Icon
            icon={
              user?.subscription?.plan?.id === item?.id
                ? 'material-symbols:check-circle-rounded'
                : 'material-symbols:circle-outline'
            }
            width={25}
            height={25}
            className="shrink-0 text-content"
          />
        )}
      </div>
      <p className="text-3xl font-bold !my-4">
        {item.is_default && !item.price ? (
          <span>FREE</span>
        ) : (
          <>
            <span>
              <span>{CurrencyFormatter(item?.price)}</span>{' '}
              {item?.discount_value ? (
                <>
                  <span className="line-through text-red-500 text-sm">
                    {CurrencyFormatter((item?.price || 0) + (item?.discount_price || 0))}
                  </span>{' '}
                </>
              ) : null}
            </span>
            <p className="text-sm">per {item?.is_monthly ? 'month' : 'year'}</p>
          </>
        )}
      </p>
      <p className="text-sm font-medium text-content">{item?.description}</p>
      <ul className="space-y-3 flex-1">
        <li>
          <div className="inline-flex items-center gap-3">
            <Icon
              icon="material-symbols:check-circle-rounded"
              width={25}
              height={25}
              className="shrink-0 text-teal-600"
            />
            <p className="text-sm font-medium text-content">
              Products limit{' '}
              <span className="inline-block py-1 px-2 rounded bg-slate-100 text-content text-center font-semibold text-xs">
                {item?.products_limit || 'Unlimited'}
              </span>
            </p>
          </div>
        </li>
        <li>
          <div className="inline-flex items-center gap-3">
            <Icon
              icon="material-symbols:check-circle-rounded"
              width={25}
              height={25}
              className="shrink-0 text-teal-600"
            />
            <p className="text-sm font-medium text-content">
              Orders limit{' '}
              <span className="inline-block py-1 px-2 rounded bg-slate-100 text-content text-center font-semibold text-xs">
                {item?.orders_limit || 'Unlimited'}
              </span>
            </p>
          </div>
        </li>
      </ul>
      <div>
        <ul className="inline-flex gap-3 items-center flex-wrap">
          {item?.services?.map((ev: any, index: number) => (
            <li key={index}>
              <p className="btn-with-icon outline-btn">{ev}</p>
            </li>
          ))}
        </ul>
      </div>
      {user ? (
        <>
          {!item.is_default && (
            <button
              className="btn-with-icon w-full !text-sm bg-primary"
              type="button"
              disabled={user?.subscription?.plan?.id === item?.id || disabled}
              onClick={GetPaymentPage}
            >
              {user?.subscription?.plan?.id === item?.id ? 'Current plan' : 'Upgrade now'}
            </button>
          )}
        </>
      ) : (
        <Link
          to="/account/login"
          className="btn-with-icon w-full !text-sm bg-primary"
        >
          Select plan
        </Link>
      )}
    </Card>
  );
}
