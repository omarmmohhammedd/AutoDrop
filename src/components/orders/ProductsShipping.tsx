import { Icon } from '@iconify/react';
import { AllHTMLAttributes, ChangeEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from 'src/helper/AxiosInstance';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import useForm from 'src/hooks/useForm';
import Image from '../shared/Image';
import ItemList from '../shared/ItemList';
import Modal from '../shared/Modal';

export default function ProductsShipping({ order, refetch }: { order: any; refetch: any }) {
  const [visible, setVisible] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  
  const { formik } = useForm({
    initialValues: {
      id: order?.id || order?._id,
      shipping: order?.products_shipping_services || []
    },
    submitHandler: async (values, helper) => {
      try {
        setDisabled(true);
        const { status } = await axiosInstance.post('orders/update-shipping', values);
        if(status === 200){
          setVisible(false)
        }
        refetch();
      } catch (error) {
        console.log(error);
      } finally {
        setDisabled(false);
      }
    }
  });

  function onShippingChange(ev: ChangeEvent<HTMLInputElement>) {
    const { value, dataset } = ev.target;
    console.log(dataset)
    const index = order?.items?.findIndex((e: any) => e.product?._id == dataset.productid);
    order?.items?.map((e:any)=> console.log(e.product._id))
    const object = {
      service_name: dataset?.serviceName,
      product_id: dataset?.productid,
      amount: dataset?.amount,
      tracking: JSON.parse(dataset?.tracking as string)
    };

    formik.setFieldValue('shipping[' + index + ']', object);
    console.log(formik.values, index);
  }
  const getProductId = async(item:any)=>{
    const { data :product} = await axiosInstance.get('products/v1/' + item.product._id);
    return product.id
  }
  return (
    <>
      {['in_transit', 'created'].includes(order.status) ? (
        <button
          type="button"
          className="btn-with-icon !text-blue-600 shrink-0 !rounded-full !p-0 !text-xs"
          onClick={() => setVisible(true)}
        >
          <Icon
            icon="akar-icons:shipping-box-01"
            width="16"
          />
          <span>Products shipping</span>
        </button>
      ) : null}
      <Modal
        title="Products shipping methods"
        size="!max-w-screen-lg"
        visible={visible}
        handleClose={() => setVisible(false)}
      >
        <form
          className="space-y-4"
          onSubmit={formik.handleSubmit}
        >
          <p className="text-gray-500 text-center text-lg">
            " The shipping value will be added to the total and the order will be sent. You can
            track it based on the chosen shipping method "
          </p>

          <ul className="divide-y divide-gray-200">
            {order?.items?.map((item: any, index: number) => (
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
                          <Shippings
                            item={item}
                            prId = {async()=>await getProductId(item)}
                            onChange={onShippingChange}
                            value={formik.values.shipping[index]?.service_name}
                          />
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
          <button
            className="btn-with-icon !text-sm !bg-secondary flex-[fit-content]"
            type="submit"
            disabled={disabled}
          >
            Submit
          </button>
        </form>
      </Modal>
    </>
  );
}

function Shippings({
  item,
  onChange,
  value,
  prId
}: {
  item: any;
  onChange: AllHTMLAttributes<HTMLInputElement>['onChange'];
  value: any;
  prId:any;
}) {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shippings, setShippings] = useState<any[]>([]);
  const [productId,setProductId] = useState('')
  useEffect(() => {
    getProductShipping();
  }, []);

  async function getProductShipping() {
    try {
      setIsLoading(true);
      const { data :product} = await axiosInstance.get('products/v1/' + item.product._id);
      setProductId(await prId())
      const body = {
        product_num: item?.quantity,
        product_id: product?.original_product_id,
        // sku_id
      };
      const { data } = await axiosInstance.post('aliexpress/products/shipping', body);
      setShippings((data.result || []).filter((e: any) => {
        console.log(e)
        if ( e.tracking_available === 'true') {
          return { ...e, amount: Number(e.freight.amount) };
        }
      }));
      
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading)
    return (
      <div>
        <div className="space-y-3 p-4 rounded border border-gray-200">
          <div className="p-2 bg-gray-200 animate-pulse w-1/2 rounded"></div>
          <div className="p-2 bg-gray-200 animate-pulse w-2/3 rounded"></div>
        </div>
      </div>
    );

  return (
    <>
      <div className="flex gap-2 flex-wrap !mt-4">
        {shippings.length ?shippings.map((shipping,i) => (
          <div key={shipping.service_name}>
            <input
              type="radio"
              name={'shipping-method-for-product-' + productId}
              id={`${i}+${productId}`}
              
              className="form-radio shrink-0 peer !hidden"
              hidden
              data-productid={productId}
              data-amount={shipping?.freight.amount}
              data-service-name={shipping?.service_name}
              data-tracking={shipping?.tracking_available && JSON.parse(shipping?.tracking_available)}
           
              onChange={onChange}
            />
            <label
              className="flex-1 cursor-pointer peer-checked:border-blue-600 peer-checked:border-2 py-3 px-4 rounded border border-gray-200 transition-all block"
              htmlFor={`${i}+${productId}`}
            >
              <div className="flex items-center gap-3 flex-wrap">
                {shipping.service_name === 'CAINIAO_CONSOLIDATION_SA' ? <span className='text-red-500 text-sm'>( Recommend )</span> : null}
                <p className="text-sm font-semibold">
                  {shipping.service_name || '-'}{' '}
                  
                  {!JSON.parse(shipping.tracking_available) ? (
                    <span className="text-red-500">
                      ( {JSON.parse(shipping.tracking_available) ? 'Tracking not available' : null}{' '}
                      )
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-blue-500">
                  {CurrencyFormatter(shipping.freight?.amount || 0)}
                </p>
              </div>
              <p className="text-sm text-gray-500">{shipping.estimated_delivery_time || '-'}</p>
            </label>
          </div>
        )): <p className="text-red-500">Product shipping is not available</p>}
      </div>
    </>
  );
}
