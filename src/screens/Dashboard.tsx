import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Card from 'src/components/shared/Card';
import EmptyCard from 'src/components/shared/EmptyCard';
import Image from 'src/components/shared/Image';
import {
  ItemInterface,
  MiniDashboardSingleCard
} from 'src/components/shared/MiniDashboardSingleCard';
import axiosInstance from 'src/helper/AxiosInstance';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import StatusColors from 'src/helper/StatusColors';
import { RootState } from 'src/store';

const globalCards: ItemInterface[] = [
  {
    color: 'text-sky-500',
    icon: 'ci:users',
    title: 'Total vendors',
    key: 'total_vendors',
    value: 0,
    type: undefined
  },
  {
    color: 'text-teal-500',
    icon: 'ri:secure-payment-fill',
    title: 'Secure vendors',
    key: 'secure_vendors',
    value: 0,
    type: undefined
  },
  {
    color: 'text-sky-500',
    icon: 'fluent:payment-24-regular',
    title: 'Available Subscriptions',
    key: 'available_subscriptions',
    value: 0,
    type: undefined
  },
  {
    color: 'text-red-500',
    icon: 'heroicons-outline:pause',
    title: 'Expired Subscriptions',
    key: 'expired_subscriptions',
    value: 0,
    type: undefined
  },
  {
    color: 'text-sky-500',
    icon: 'solar:hand-money-outline',
    title: 'Total transactions',
    key: 'total_transactions',
    value: 0,
    type: 'currency'
  },
  {
    color: 'text-orange-500',
    icon: 'ph:shopping-bag-bold',
    title: 'Total products',
    key: 'total_products',
    value: 0,
    type: undefined
  }
];
const vendorCards: ItemInterface[] = [
  {
    color: 'text-red-500',
    icon: 'tabler:cash-banknote-off',
    title: 'Unpaid amount',
    key: 'unpaid_amount',
    value: 0,
    type: undefined
  },
  {
    color: 'text-slate-500',
    icon: 'solar:wallet-money-linear',
    title: 'Suspended earnings',
    key: 'suspended_earnings',
    value: 0,
    type: undefined
  },
  {
    color: 'text-teal-500',
    icon: 'solar:wallet-linear',
    title: 'Earnings',
    key: 'total_earnings',
    value: 0,
    type: undefined
  },
  {
    color: 'text-orange-500',
    icon: 'ph:shopping-bag-bold',
    title: 'Total products',
    key: 'total_products',
    value: 0,
    type: undefined
  }
];

export default function Dashboard() {
  let rerender: boolean = true;
  const [dashboard, setDashboard] = useState<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [cards, setCards] = useState<ItemInterface[]>(
    user?.userType === 'admin' ? globalCards : vendorCards
  );

  useEffect(() => {
    if (!rerender) return;

    (async () => {
      await GetDashboard();
    })();

    rerender = false;
  }, []);

  async function GetDashboard() {
    try {
      const { data } = await axiosInstance.get('dashboard');
      // console.log(data);
      setDashboard(data);
      setCards((_cards) => {
        return _cards.map((card) => {
          const value = data?.summary?.[card.key as string];
          if (value) {
            return {
              ...card,
              value: card.type === 'currency' ? CurrencyFormatter(Number(value || 0)) : value
            };
          }
          return card;
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="p-8 pt-2 space-y-4">
      <p className="text-base font-medium text-slate-600">Summary</p>
      <div className="grid grid-wrapper gap-4">
        {cards.map((card, index) => (
          <MiniDashboardSingleCard
            item={card}
            key={index}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <p className="text-base font-medium text-slate-600">Recent products</p>
          <Card className={!dashboard?.products?.length ? 'py-10' : ''}>
            {dashboard?.products?.length ? (
              <ul className="divide-y divide-slate-100">
                {dashboard?.products?.map((item: any, index: number) => (
                  <li
                    key={index}
                    className="pb-4 last:pb-0 pt-4 first:pt-0"
                  >
                    <Link
                      to={{ pathname: 'products/' + item.id }}
                      className="flex gap-4 items-center"
                    >
                      <Image
                        src={item?.images?.[0]?.original}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold text-title line-clamp-2">{item.name}</p>
                        <p className="text-sm text-slate-500 font-medium">
                          {CurrencyFormatter(item?.price)}
                        </p>
                      </div>
                      <p className="inline-block self-start py-1.5 px-2 rounded bg-blue-500 text-xs font-medium text-center shrink-0 text-white">
                        NEW
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyCard
                icon={'solar:bag-3-outline'}
                title={'No products'}
                content={'There are no products added yet'}
              />
            )}
          </Card>
          {/* <Card>
            <div className="inline-flex gap-4 items-center">
              <Image className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-base font-medium text-slate-800 line-clamp-1">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam, illo?
                </p>
                <p className="text-sm font-semibold text-teal-600">{CurrencyFormatter(100)}</p>
              </div>
            </div>
          </Card> */}
        </div>
        <div className="space-y-4 hidden">
          <p className="text-base font-medium text-slate-600">Recent orders</p>
          <Card className={!dashboard?.orders?.length ? 'py-10' : ''}>
            {dashboard?.orders?.length ? (
              <ul className="divide-y divide-slate-100">
                {dashboard?.orders?.map((item: any, index: number) => (
                  <li
                    key={index}
                    className="pb-4 last:pb-0 pt-4 first:pt-0"
                  >
                    <Link
                      to={'/orders/' + item.id}
                      className="flex gap-4 items-center"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-slate-500 font-medium">#{item.order_id}</p>
                        <p className="text-sm font-semibold text-title">
                          {CurrencyFormatter(item?.amounts?.total?.amount)}
                        </p>
                      </div>
                      <p
                        className={[
                          'inline-block self-start py-1.5 px-2 rounded  text-xs font-medium text-center shrink-0 capitalize',
                          StatusColors(item.status)
                        ].join(' ')}
                      >
                        {item.status}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyCard
                icon={'solar:cart-line-duotone'}
                title={'No orders'}
                content={'There are no orders found'}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
