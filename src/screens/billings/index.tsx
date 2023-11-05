import { Icon } from '@iconify/react';
import { AxiosError } from 'axios';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Card from 'src/components/shared/Card';
import Image from 'src/components/shared/Image';
import PlanSingleCard from 'src/components/shared/PlanSingleCard';
import axiosInstance from 'src/helper/AxiosInstance';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import { useAlert } from 'src/hooks/alerts';
import { RootState } from 'src/store';

function useHooks() {
  let rerender: boolean = true;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>();

  useEffect(() => {
    if (!rerender) return;

    (async () => {
      await Promise.all([GetPlans(), GetTransactions()]).finally(() => setIsLoading(false));
    })();
  }, []);

  async function GetPlans() {
    try {
      const { data } = await axiosInstance.get('plans');
      setPlans(data);
    } catch (error) {
      console.log('error while getting plans');
    }
  }

  async function GetTransactions(params?: any) {
    try {
      const { data } = await axiosInstance.get('transactions');
      // setPlans(data);
      setTransactions(data.data);
      setPagination(data.pagination);
      console.log(data);
    } catch (error) {
      console.log('error while getting transactions');
    }
  }
  return { plans, isLoading, transactions, pagination, setPagination, GetTransactions };
}

export default function index() {
  const { isLoading, plans, transactions } = useHooks();
  const { user } = useSelector((state: RootState) => state.auth);

  const GetRemandingDays = useMemo(() => {
    const subscription = user?.subscription;
    const firstDate = subscription?.start_date;
    const secondDate = subscription?.expiry_date;

    const total = moment(secondDate).diff(moment(firstDate), 'days');
    const remaining = moment(secondDate).diff(moment(), 'days', true);
    return {
      total: Math.round(total || 0),
      remaining: Math.round((remaining <= 0 ? 0 : remaining) || 0)
    };
  }, [user]);

  return (
    <div className="p-8 pt-2 space-y-6">
      <header className="space-y-1">
        <p className="text-2xl font-bold text-title">Available plans</p>
        <p className="text-sm font-medium text-content">Manege your plan and billing details.</p>
      </header>
      <Card className="space-y-4">
        {!user?.subscription ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-8 bg-slate-800/5 backdrop-blur-sm">
            <p className="text-sm text-center text-slate-800 font-medium italic">
              There is no plan available to view details, select your perfect plan then try again.
            </p>
          </div>
        ) : null}
        {!GetRemandingDays?.remaining && user?.subscription ? <SubscribeCard /> : null}
        <div className="space-y-1">
          <p className="text-2xl font-bold text-title">Current plan details</p>
          <p className="text-sm font-medium text-content">
            Details of the plan currently subscribed to and related features are displayed. You can
            re-renew when the subscription period is completed. You will be notified via our
            registered email
          </p>
        </div>
        <ul className="space-y-2">
          <li className="space-y-2">
            <div className="flex gap-4 justify-between">
              <p className="text-sm font-medium text-content">Remaining days</p>
              <p className="text-sm font-medium text-title">{GetRemandingDays?.remaining} day(s)</p>
            </div>

            <Slider
              first={GetRemandingDays?.remaining}
              second={GetRemandingDays?.total}
            />
          </li>
          <li className="space-y-2">
            <div className="flex gap-4 justify-between">
              <p className="text-sm font-medium text-content">Orders limit</p>
              <p className="text-sm font-medium text-title">
                {user?.subscription?.orders_limit || 0} /{' '}
                {user?.subscription?.plan?.orders_limit || 0}
              </p>
            </div>

            <Slider
              first={+user?.subscription?.orders_limit || 0}
              second={+user?.subscription?.plan?.orders_limit || 0}
            />
          </li>
          <li className="space-y-2">
            <div className="flex gap-4 justify-between">
              <p className="text-sm font-medium text-content">Products limit</p>
              <p className="text-sm font-medium text-title">
                {user?.subscription?.products_limit || 0} /{' '}
                {user?.subscription?.plan?.products_limit || 0}
              </p>
            </div>

            <Slider
              first={+user?.subscription?.products_limit || 0}
              second={+user?.subscription?.plan?.products_limit || 0}
            />
          </li>
        </ul>
      </Card>
      <div className="grid grid-wrapper gap-4">
        {plans.map((plan: any, index: number) => (
          <PlanSingleCard
            key={index}
            item={plan}
          />
        ))}
      </div>
      <p className="text-lg font-bold text-title">Transactions history</p>
      <ul className="space-y-2">
        {transactions?.length
          ? transactions?.map((item: any, index: number) => (
              <SingleTransactionCard
                item={item}
                key={index}
              />
            ))
          : null}
      </ul>
    </div>
  );
}

function Slider({ first = 0, second = 0 }: { first: any; second: any }) {
  const percent = useMemo(() => {
    let result: number = 0;
    // console.log(first, second);

    if (typeof first === 'number' && typeof second === 'number') {
      const total = (+first / +second) * 100;
      result = parseFloat(total?.toFixed(2));
    }
    return result;
  }, [first, second]);

  return (
    <div className="w-full p-1 bg-slate-100 rounded-lg h-6">
      <div
        className="h-full bg-teal-600 rounded-md"
        style={{
          width: (percent || 0) + '%'
        }}
      ></div>
    </div>
  );
}

function SingleTransactionCard({ item }: any) {
  return (
    <li>
      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-2xl font-bold text-title">{CurrencyFormatter(item.amount || 0)}</p>
          <p className="text-sm font-medium text-content">{item?.createdAt}</p>
        </div>

        <details className="p-3 px-4 rounded-lg border border-gray-200">
          <summary className="appearance-none text-sm font-semibold cursor-pointer">
            View details
          </summary>
          <div className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {item?.plan ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <li className="space-y-1">
                    <p className="text-sm text-content">Name</p>
                    <p className="text-base text-title font-semibold">
                      {item?.plan?.name || 'N/A'}
                    </p>
                  </li>
                  <li className="space-y-1">
                    <p className="text-sm text-content">Status</p>
                    <p className="max-w-fit py-1 px-2 rounded bg-slate-100 text-content text-center font-semibold text-xs">
                      {item?.status || 'N/A'}
                    </p>
                  </li>
                  <li className="space-y-1">
                    <p className="text-sm text-content">Price</p>
                    <p className="text-base text-title font-semibold">
                      {' '}
                      <span>{CurrencyFormatter(item?.plan?.price)}</span>{' '}
                      {item?.plan?.discount_value ? (
                        <>
                          <span className="line-through text-red-500 text-sm">
                            {CurrencyFormatter(item?.plan?.discount_price)}
                          </span>{' '}
                        </>
                      ) : null}
                    </p>
                  </li>
                </ul>
              ) : null}
              {item?.order ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <li className="space-y-1">
                    <p className="text-sm text-content">Amount</p>
                    <p className="text-base text-title font-semibold">
                      {CurrencyFormatter(item?.amount)}
                    </p>
                  </li>
                  <li className="space-y-1">
                    <p className="text-sm text-content">Status</p>
                    <p className="max-w-fit py-1 px-2 rounded bg-slate-100 text-content text-center font-semibold text-xs">
                      {item?.status || 'N/A'}
                    </p>
                  </li>
                  <li className="space-y-1">
                    <p className="text-sm text-content">Customer</p>
                    <div>
                      <div className="inline-flex items-center gap-4">
                        <Image
                          src={item?.order?.customer?.avatar}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 grid">
                          <p className="text-base text-title font-semibold">
                            {item?.order?.customer?.first_name || 'N/A'}
                          </p>
                          <p className="text-sm text-content font-medium truncate">
                            {item?.order?.customer?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="space-y-1">
                    <p className="text-sm text-content">View order in</p>
                    <div>
                      <ul className="inline-flex gap-2 flex-wrap">
                        <li>
                          <Link
                            to={item?.order?.urls?.admin}
                            className="btn-with-icon outline-btn"
                          >
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link
                            to={item?.order?.urls?.customer}
                            className="btn-with-icon outline-btn"
                          >
                            Store
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>
        </details>
      </Card>
    </li>
  );
}

function SubscribeCard() {
  const alert = useAlert();
  const [disabled, setDisabled] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const ResubscribeAction = useCallback(async () => {
    try {
      setDisabled(true);
      const { data } = await axiosInstance.post('plans/resubscribe', {
        id: user?.subscription?.plan?.id
      });
      window.location.href = data.url;
    } catch (error: AxiosError | any) {
      const err = error?.response?.data;
      const message = err?.message;
      alert.show({ text: message, visible: true });
      // console.log(error);
    } finally {
      setDisabled(false);
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center p-8 bg-slate-800/5 backdrop-blur-sm flex-col space-y-4">
      <p className="text-sm text-center text-slate-800 font-medium italic">
        Your subscription has been ended!!
      </p>
      <button
        className="btn-with-icon bg-primary"
        disabled={disabled}
        onClick={ResubscribeAction}
      >
        <span>Upgrade now</span>
      </button>
    </div>
  );
}
