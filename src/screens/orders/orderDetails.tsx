import ProductsShipping from 'src/components/orders/ProductsShipping';
import SendOrder from 'src/components/orders/SendOrder';
import UpdateCustomerAddress from 'src/components/orders/UpdateCustomerAddress';
import UpdateCustomerDetails from 'src/components/orders/UpdateCustomerDetails';
import Card from 'src/components/shared/Card';
import Image from 'src/components/shared/Image';
import ItemList from 'src/components/shared/ItemList';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import useOrderHooks from 'src/hooks/orders/id';
import {useEffect, useState} from 'react'
export default function OrderDetailss() {
  const [order,setOrder] = useState<any>()
  console.log('asd')
  useEffect(()=>{
    const {
      isLoading,
      order: { order:orderData, unpaid_amount, amount_included_vat, fixedShippingFees, vat_value },
      
    } = useOrderHooks();
    setOrder(orderData)
  },[])
  const {GetOrder} = useOrderHooks()
  console.log(order)
  useEffect(()=>{
    console.log(order)
  },[order])
  const instructions = [
    'Before paying for the order, you must know the shipping details for each product',
    'Check your payment information before paying',
    'You can send the request after payment and completing the previous procedures',
    'You can track the order after sending the order to know everything new about the status of the order and shipping as well',
    'Any action taken through your store will not be taken into account within the order procedures. Only the status of the product will be changed within your store from here.'
  ];
  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col-reverse xl:flex-row items-start gap-4">
        <div className="w-full xl:max-w-xs flex-1 space-y-4">
          <Card className="space-y-4">
            <p className="pb-3 border-b border-b-gray-200 text-sm font-semibold">Order summary</p>
            <ul className="divide-y divide-gray-200">
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {CurrencyFormatter(order?.subtotal || 0)}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">VAT</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {CurrencyFormatter(order?.payment_vat || 0)}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Expected earning</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {CurrencyFormatter(order?.profit || 0)}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Shipping amount</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {CurrencyFormatter(order?.shipping_amount || 0)}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {CurrencyFormatter(order?.total || 0)}
                  </p>
                </div>
              </ItemList>
              {['created'].includes(order?.status) ? (
                <ItemList className="py-3 space-y-1">
                  {/* <PlaceOrderForm
                    order={order}
                    amount={order?.total as number}
                  /> */}
                  <SendOrder />
                </ItemList>
              ) : null}
              {order?.status === 'in_transit' ? (
                <ItemList className="py-3 space-y-1">
                  <SendOrder />
                </ItemList>
              ) : null}
            </ul>
          </Card>
          <Card className="space-y-4">
            <div className="flex justify-between items-center gap-4 pb-3 border-b border-b-gray-200">
              <p className=" text-sm font-semibold">Customer details</p>
              <UpdateCustomerDetails
                order={order}
                refetch={GetOrder}
              />
            </div>
            <ul className="divide-y divide-gray-200">
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {`${order?.customer?.first_name} ${order?.customer?.last_name}`}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {`${order?.customer?.mobile_code}${order?.customer?.mobile}`}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">E-mail address</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {order?.customer?.email || '-'}
                  </p>
                </div>
              </ItemList>
            </ul>
          </Card>
        </div>
        <div className="w-full flex-1 space-y-4">
          <Card className="space-y-4">
            <div className="space-y-2">
              <p className="text-lg font-semibold">Instructions while creating the order</p>
              <ul className="list-disc ps-5 space-y-1">
                {instructions.map((item, index) => (
                  <li key={index}>
                    <p className="text-sm text-gray-500">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          <Card className="space-y-4">
            <div className="flex justify-between items-center gap-4 pb-3 border-b border-b-gray-200">
              <p className=" text-sm font-semibold">Shipping address</p>
              {/* <UpdateCustomerAddress
                order={order}
                refetch={GetOrder}
              /> */}
            </div>
            <ul className="divide-y divide-gray-200">
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {order?.customer_address?.country || '-'}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">City</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {order?.customer_address?.city || '-'}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Zip / Postal code </p>
                  <p className="text-sm font-semibold text-end break-all">
                    {order?.customer_address?.postal_code || '-'}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {order?.customer_address?.shipping_address || '-'}
                  </p>
                </div>
              </ItemList>
            </ul>
          </Card>
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-4 pb-3 border-b">
              <p className=" border-b-gray-200 text-sm font-semibold">Order items</p>
              <ProductsShipping
                order={order}
                refetch={GetOrder}
              />
            </div>
            <ul className="divide-y divide-gray-200">
              {order?.items?.map((item: any) => (
                <ItemList
                  className="py-3 space-y-1"
                  key={item.product?.id}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <Image
                          className="w-14 h-14 rounded-full object-cover shrink-0"
                          src={item.thumbnail}
                        />
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-base font-semibold">{item.product?.name || '-'}</p>
                            {item.options?.map((option: any) => (
                              <p
                                className="text-sm text-gray-500"
                                key={option.option?.id}
                              >
                                <span className="font-semibold text-black">
                                  {option.option?.name}:{' '}
                                </span>{' '}
                                {option.value?.name} -{' '}
                                {CurrencyFormatter(option.value?.original_price)}
                              </p>
                            ))}
                            <p className="text-sm text-gray-500">
                              <span className="font-semibold text-black">Quantity: </span>{' '}
                              {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-end break-all">
                      {CurrencyFormatter(item.total || 0)}
                    </p>
                  </div>
                </ItemList>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
