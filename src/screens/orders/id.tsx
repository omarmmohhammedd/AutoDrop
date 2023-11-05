import  { Fragment, useState, useCallback, useEffect } from 'react';
import { MoveToTop } from 'src/animations';
import { motion } from 'framer-motion';
import SharedTime from 'src/components/shared/SharedTime';
import Image from 'src/components/shared/Image';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import { Icon } from '@iconify/react';
import Modal from 'src/components/shared/Modal';
import UpdateStatusForm from './components/UpdateStatusForm';
import useOrderHooks from 'src/hooks/orders/id';
import LoadingComponent from 'src/components/shared/LoadingComponent';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';
import axios, { AxiosError } from 'axios';
import useForm from 'src/hooks/useForm';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import Translate from 'translate';
import { translateCity ,getProvince, cities} from 'src/helper/City';
import ProductsShipping from 'src/components/orders/ProductsShipping';
import { RadioGroup } from '@headlessui/react';
import ConvertCurrenct from 'src/hooks/ConvertCurrenct';
import UpdateCustomerDetails from 'src/components/orders/UpdateCustomerDetails';
import * as Yup from 'yup';
import ItemList from 'src/components/shared/ItemList';
import Card from 'src/components/shared/Card';
import UpdateCustomerAddress from 'src/components/orders/UpdateCustomerAddress';


export default function id() {
  const [statusVisible, setStatusVisible] = useState<boolean>(false);
  const [payVisible, setPayVisible] = useState<boolean>(false);
  const [viewStatusModal, setViewStatusModal] = useState<boolean>(false);
  const [city,setCity] = useState('')
  const [citiesData,setCitiesData]= useState([])
  const [province,setProvince] = useState('')
  const [initialValues,setInitialValues] = useState<any>({
    firstName:'',
    middleName:'',
    lastName:'',
    phone:'',
    zipcode:'',
    street:'',
    district:'',
    city:'',
    province:'',
    shipMethod:''
  })
  const [shippingProducts,setShippingProducts] = useState<any>([])
  const instructions = [
    'Before paying for the order, you must know the shipping details for each product',
    'Check your payment information before paying',
    'You can send the request after payment and completing the previous procedures',
    'You can track the order after sending the order to know everything new about the status of the order and shipping as well',
    'Any action taken through your store will not be taken into account within the order procedures. Only the status of the product will be changed within your store from here.',
    'You Should Enter All Data Of Order in English Only'
  ];
  const {
    isLoading,
    order: { order, unpaid_amount, amount_included_vat, vat_value },
    GetOrder
  } = useOrderHooks();
  useEffect(()=>{

    (async()=>{
      setCity(order?.shipping?.address?.city_en || translateCity(order?.shipping?.address?.city))
      let arr : Array<Object>= []
      order?.items.length && await Promise.all(order.items.map(async(e:any)=>{
         let {data:product} = await axiosInstance.get(`/products/v1/${e.product._id}`)
         const {data:productShipping} = await axiosInstance.post(`/products/v1/shipping/${product.original_product_id}`,{product_num:e.quantity})
         await axiosInstance.post('/aliexpress/products/shipping',{product_num:e.quantity,product_id:product.original_product_id})
         .then((res)=>{
          arr.push({product,shipping:res.data.result})
         })
        
      }))
      console.log(order?.shipping.address.city_en || order?.shipping.address.city)
      console.log(getProvince(order?.shipping.address.city))
      setShippingProducts(arr)
    })()
    setCitiesData(Object.values(cities))
  },[order])
    useEffect(()=>{
      setProvince(getProvince(order?.shipping.address.city_en || translateCity(order?.shipping?.address?.city)))
    },[city])
  const { user } = useSelector((state: RootState) => state.auth);
  const alert = useAlert();

  const handlePrintPage = useCallback(function () {
    window.print();
  }, []);
  const AliExpressOrder = async(values:any)=>{
    // await axiosInstance.post('/aliexpress/orders/place-order',{id:order.id,shippingData:{'country':'SA'}}).then((res)=>{
    //   console.log(res.data)
    // })
  }

  const {
    formik: { handleSubmit, handleChange, values, setFieldValue,validateForm }
  } = useForm({ initialValues, submitHandler: AliExpressOrder });
  // *** shipping fees ****
  const totalUnpaidAmount = (amount_included_vat || 0) ;
  // ******end ******

  if (isLoading) return <LoadingComponent />;

  async function DeleteOrder() {
    try {
      const { data } = await axiosInstance.post('orders/delete', { id: order.id });
      alert.show({
        visible: true,
        text: data?.message
      });
    } catch (error: AxiosError | any) {
      const err = error?.response?.data;

      if (err) {
        alert.show({
          visible: true,
          text: err?.message
        });
      }
    }
  }

  async function UpdateOrderStatus(status: string, id: string) {
    try {
      const { data } = await axiosInstance.post('orders/update-status', {
        orderId: id,
        merchant: user?.id,
        status
      });

      alert.show({
        text: data.message,
        visible: true
      });
    } catch (error: AxiosError | any) {
      const err = error?.response?.data;

      if (err?.message instanceof Object) {
        console.log('error while updating order => ', err?.message);
      } else {
        alert.show({
          text: err?.message,
          visible: true
        });
      }
    }
  }


   return (
    <Fragment>
      <div className="relative p-8 pt-2 print:!p-0">
        <div className="flex flex-col-reverse xl:flex-row items-start gap-4">
          <div className="flex-1 w-full xl:max-w-sm space-y-4 hidden">
            <motion.div
              variants={MoveToTop}
              animate="visible"
              initial="hidden"
              className="rounded-2xl bg-white border border-ring-border shadow-2xl shadow-neutral-800/5 p-5 w-full hidden"
            >
              <p className="text-base font-bold text-title pb-5 border-b border-b-ring-border">
                Payment details
              </p>
            </motion.div>
            <motion.div
              variants={MoveToTop}
              animate="visible"
              initial="hidden"
              className="rounded-2xl bg-white border border-ring-border shadow-2xl shadow-neutral-800/5 p-5 w-full"
            >
              <p className="text-base font-bold text-title pb-5 border-b border-b-ring-border">
                Order history
              </p>
              <ul className="divide-y divide-ring-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li
                    key={i}
                    className="py-4 last:pb-0"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="relative flex flex-col justify-center items-center">
                        <span className="w-3 h-3 rounded-full bg-primary block shrink-0 relative">
                          <span className="absolute w-full h-full animate-ping bg-primary/50 rounded-full"></span>
                        </span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-base font-bold text-title">Status name</p>
                        <SharedTime date={new Date()} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
          <div className="w-full flex-1 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <p className="text-lg font-bold text-content">
                  Order <span className="text-sky-600">#{order?.reference_id}</span>
                </p>
                <SharedTime date={order?.createdAt} />
              </div>

              {/* PAYNOW & PRINT Button  */}
              <div className="flex items-center gap-2 flex-wrap">
                {order?.status === 'created' && user?.userType === 'vendor' ? (
                  
                  <button
                    className="btn-with-icon outline-btn !text-content"
                    onClick={() => setPayVisible(true)}
                  >
                    <Icon
                      icon="fluent:payment-16-regular"
                      width={20}
                      height={20}
                      className="text-sub-title"
                    />
                    <p className="text-sm text-content flex-1">Pay now</p>
                  </button>
                ) : null}
                {/* {order?.status !== 'created' && user?.userType === 'admin' ? (
                  <button
                    className="btn-with-icon outline-btn !text-content"
                    onClick={() => setStatusVisible(true)}
                  >
                    <Icon
                      icon="ant-design:file-done-outlined"
                      width={20}
                      height={20}
                      className="text-sub-title"
                    />
                    <p className="text-sm text-content flex-1">Update order status</p>
                  </button>
                ) : null} */}
                <button
                  className="btn-with-icon outline-btn !text-content"
                  onClick={handlePrintPage}
                >
                  <Icon
                    icon="ion:print-outline"
                    width={20}
                    height={20}
                    className="text-sub-title"
                  />
                  <p className="text-sm text-content flex-1">Print</p>
                </button>
              </div>
            </div>
            <motion.div
              variants={MoveToTop}
              animate="visible"
              initial="hidden"
              className="rounded-2xl bg-white border border-ring-border shadow-2xl shadow-neutral-800/5 p-5 w-full"
            >
              <p className="text-base font-bold text-title pb-5 border-b border-b-ring-border">
                Customer & shipping details
              </p>
              
              <form onSubmit={handleSubmit} >

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
                {/* <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-5">
                <div className='col-span-full text-lg text-gray-600 flex justify-between'>
                <span>User Contact</span>               
                <UpdateCustomerDetails
                order={order}
                refetch={GetOrder}
              /></div>
                <li>
                  <div className="inline-flex flex-col gap-3 px-3">
                  <span className='text-sm text-gray-500'>First Name</span>
                    <input 
                          type="text"
                          className="form-input"
                          name="firstName"
                          onChange={handleChange}     
                          defaultValue={order?.customer?.first_name}
                          placeholder="First Name"
                          disabled={true}
                     />
                  </div>
                </li>
                <li>
                <div className="inline-flex flex-col gap-3 px-3">
                  <span className='text-sm text-gray-500'>Middle Name</span>
                    <input                           
                          type="text"
                          className="form-input"
                          name="middleName"
                          onChange={handleChange}
                          placeholder='Middle Name'   disabled={true}/>
                  </div>
                </li>
                <li>
                <div className="inline-flex flex-col gap-3 px-3">
                  <span className='text-sm text-gray-500'>Last Name</span>
                    <input                          
                          type="text"
                          className="form-input"
                          name="lastName"
                          onChange={handleChange}     
                          defaultValue={order?.customer?.last_name}
                          placeholder="Last Name"   disabled={true}/>
                  </div>
                </li>
                <li>
                <div className="inline-flex flex-col gap-3 px-3">
                  <span className='text-sm text-gray-500'>Phone</span>
                  <div className='flex items-center gap-x-2'>
                    <span className='text-sm text-gray-500'>+966</span>
                    <input                          
                          type="text"
                          maxLength={9}
                          className="form-input "
                          name="lastName"
                          onChange={handleChange}     
                          defaultValue={order?.customer?.mobile}
                          placeholder="Phone"   disabled={true}
                      />
                    </div>
                  </div>
                   
                </li>

                <header className='text-lg text-gray-600 col-span-full'>Shipping Details</header>
                <li>
                <div className="inline-flex flex-col gap-3 px-3">
                  <span className='text-sm text-gray-500'>Country</span>
                        <input 
                          className="form-input"
                          type='text'
                          value= 'Saudi Arabia'
                          />
                  </div>
                </li>

                <li>
                <div className="inline-flex flex-col gap-3 px-3">
                  <span className='text-sm text-gray-500'>City</span>
                     <select  
                        className="form-input" 
                       defaultValue={city} 
                       onChange={handleChange} 
                       onBlur={(e)=>{
                        setProvince(getProvince(e.target.value))
                       }}
                       name='city'>
                      {citiesData.length && citiesData.map((e)=>{
                        return (
                          <option>{e}</option>
                        )
                      })}
                     </select>
                  </div>
                </li>

                <li >
                <div className="inline-flex flex-col gap-3 px-3">
                  <span className='text-sm text-gray-500'>Province</span>
                         <input className="form-input" value={province} name="provice"/>
                      
                  </div>
                </li>
                <li >
                <div className="inline-flex flex-col gap-3 px-3">
                  <span className='text-sm text-gray-500'>Zip Code</span>
                         <input className="form-input" value={ order?.shipping?.address?.postal_code ||
                        order?.shipping?.pickup_address?.postal_code ||
                        'N/A'} name="zipcode"/>
                      
                  </div>
                </li>
                <li >
                <div className="inline-flex flex-col gap-3 px-3">
                  <span className='text-sm text-gray-500'>District</span>
                         <input className="form-input" value={''} name="district"/>
                      
                  </div>
                </li>
                <li >
                <div className="inline-flex flex-col gap-3 px-3">
                  <span className='text-sm text-gray-500'>Street</span>
                         <input className="form-input" value={''} name="street"/>
                      
                  </div>
                </li>
                </ul> */}
        <div className='grid md:grid-cols-2 gap-x-2 grid-cols-1 items-start'>
                  <Card className="space-y-4  my-2">
            <div className="flex justify-between items-center gap-4 pb-3 border-b border-b-gray-200 ">
              <p className=" text-sm font-semibold">Customer details</p>
              <UpdateCustomerDetails
                order={order}
                refetch={GetOrder}
              />
            </div>
            <ul className="divide-y divide-gray-200">
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">First Name</p>
                  <p className="text-sm font-semibold text-end break-all">
                  {order?.customer?.first_name}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Middle Name</p>
                  <p className="text-sm font-semibold text-end break-all">
                  {order?.customer?.middle_name || '-'}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Last Name</p>
                  <p className="text-sm font-semibold text-end break-all">
                  {order?.customer?.last_name}
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
              <Card className="space-y-4 my-2">
            <div className="flex justify-between items-center gap-4 pb-3 border-b border-b-gray-200">
              <p className=" text-sm font-semibold">Shipping address</p>
              <UpdateCustomerAddress
                order={order}
                refetch={GetOrder}
                getProvince={getProvince}
                citiesData={citiesData}
              />
            </div>
            <ul className="divide-y divide-gray-200">
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="text-sm font-semibold text-end break-all">
                  Saudi Arabia
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">City</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {order?.shipping?.address?.city_en || city}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Province</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {order?.shipping?.address?.province_en || province}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Zip / Postal code </p>
                  <p className="text-sm font-semibold text-end break-all">
                  { order?.shipping?.address?.postal_code } 
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">District</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {order?.shipping?.address?.district_en || '-'}
                  </p>
                </div>
              </ItemList>
              <ItemList className="py-3 space-y-1">
                <div className="grid grid-cols-2">
                  <p className="text-sm text-gray-500">Street</p>
                  <p className="text-sm font-semibold text-end break-all">
                    {order?.shipping?.address?.street_en || '-'}
                  </p>
                </div>
              </ItemList>
            </ul>
          </Card>
        </div>
              {/* <Card>
              <p className=" text-sm font-semibold">Shipping Method</p>
             <div className='flex flex-col'>
              <div className='hidden mx-6 mb-5 sm:flex'>
              <div className='w-1/4 sm:flex hidden'>
                  <span className='text-sm text-gray-500'>Product</span>
                </div>
                  <div className='w-3/4 ml-5 sm:grid  sm:grid-cols-3 hidden '>
                          <span className='text-sm text-gray-500'>Company Name</span>
                          <span className='text-sm text-gray-500'>Price</span>
                          <span className='text-sm text-gray-500'>Time</span>
                  </div>
                </div>
                        {
                          shippingProducts.length ? shippingProducts.map((product:any,index:number)=>{
                            return (
                              <div className='flex items-center gap-x-5 mx-5 flex-col sm:flex-row   py-1' style={index!==shippingProducts.length -1 ? {borderBottom:"1px solid #aba2a3"} : {borderBottom:"1px solid white"}}>
                                <div className='flex  w-full sm:w-1/4'>
                                  <img src={product?.product.images[0].thumbnail}className="w-20 h-20 rounded-lg object-cover border border-ring-border shrink-0" />
                                  <span className='m-2 text-xs'>{product.product?.name.substring(0,40)}</span>
                                </div>
                                <div className='w-full sm:w-3/4 '>
                            
                                  {product&&product.shipping.length && product.shipping.map((ship:any,i:number)=>{
                                    return(
                                      <div  className=' grid grid-cols-1 sm:grid-cols-3 hover:opacity-60  items-center justify-center py-2 cursor-pointer' style={i!==product.shipping.length -1 ? {alignItems:'center',borderBottom:"1px solid #aba2a3"}:{borderBottom:"1px solid white",alignItems:'center'} }>
                                        <div className='flex gap-x-2 items-center'>
                                              <input type='radio' id={`shipMethod-${i}-${index}`}  name={`shipMethod${index}`}  className=' w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600' onChange={(e)=>{
                                                setProductsShipping([...productsShipping])
                                              }}/> 
                                              <label htmlFor={`shipMethod-${i}-${index}`} className='text-sm text-black' > {ship.service_name} </label>
                                        </div>  
                                         <label htmlFor={`shipMethod-${i}-${index}`} className='text-sm text-black'>{CurrencyFormatter(ship.freight.amount)}</label>
                                        <label htmlFor={`shipMethod-${i}-${index}`} className='text-sm text-black'>  {ship.estimated_delivery_time}</label>
                                      </div>
                                     
                                        // <option>
                                        //   <div className='flex '>
                                        //   <span>{ship.service_name}</span>
                                        //   <span className='text-sm text-black'>{CurrencyFormatter(ship.freight.amount)}</span>
                                        //   <span className='text-sm text-black'>  {ship.estimated_delivery_time}</span>
                                        //   </div>
                                        // </option>
                                    
                                    )
                                  })}
                          
                                </div>
                              </div>
                            )
                          }) : <div className='w-full flex items-center justify-center h-20 text-gray-500'>Loading...</div>
                        }
             </div>
             <div className='w-full flex items-end justify-end text-base text-white  col-span-full'>
              <button         
              className=" bg-secondary  text-center m-2 px-5 py-2 rounded-lg hover:opacity-70 transition-all hover:scale-105"
              type="submit"
              >Submit</button>
              </div>
              </Card> */}
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
                            <p className=" font-semibold text-sm">{item.product?.name|| '-'}</p>
                            {item.options?.map((option: any) => (
                              <p
                                className="text-sm text-gray-500"
                                key={option.option?.id}
                              >
                                <span className="font-semibold text-black">
                                  {option.option?.name}:{' '}
                                </span>{' '}
                                {option.value?.name} -{' '}
                                {CurrencyFormatter(item?.shipping?.amount || 0)}
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
                      {CurrencyFormatter(item?.product?.shipping?.amount || 0)}
                    </p>
                  </div>
                </ItemList>
              ))}
            </ul>
          </Card>
                </form>
            </motion.div>
            <motion.div
              variants={MoveToTop}
              animate="visible"
              initial="hidden"
              className="rounded-2xl bg-white border border-ring-border shadow-2xl shadow-neutral-800/5 p-5 w-full"
            >
              <p className="text-base font-bold text-title pb-5 border-b border-b-ring-border">
                Order items
              </p>
              <ul className="divide-y divide-ring-border">
                {order?.items?.map((item: any, i: number) => (
                  <li
                    key={i}
                    className="py-4 last:pb-0"
                  >
                    <div className="flex gap-4 items-start flex-col sm:flex-row">
                      <Image
                        src={item?.thumbnail}
                        className="w-20 h-20 rounded-lg object-cover border border-ring-border shrink-0"
                      />
                      <div className="flex-1 shrink-0 gap-8 flex flex-col sm:flex-row">
                        <div className="flex-1 space-y-1">
                          <p className="text-base font-semibold text-title line-clamp-2 !mb-3">
                            {item?.product?.name}
                          </p>
                          <p className="text-sm text-content grid grid-cols-2 gap-2">
                            <span className="text-gray-500">Product price:</span>{' '}
                            <span className="font-semibold text-title inline-block">
                              {CurrencyFormatter(item?.product?.price)}
                            </span>
                          </p>
                          <p className="text-sm text-content grid grid-cols-2 gap-2">
                            <span className="text-gray-500">Main price:</span>{' '}
                            <span className="font-semibold text-title inline-block">
                              {CurrencyFormatter(
                                Number(item?.product?.price || 0) -
                                  Number(
                                    order?.meta[item?.product?.salla_product_id]?.vendor_price || 0
                                  )
                              )}
                            </span>
                          </p>
                          <p className="text-sm text-sub-content grid grid-cols-2 gap-2">
                            <span className="text-gray-500">SKU:</span>
                            <span className="font-semibold text-title inline-block truncate break-all">
                              {item?.sku}
                            </span>
                          </p>
                          <p className="text-sm text-sub-content grid grid-cols-2 gap-2">
                            <span className="text-gray-500">Quantity:</span>
                            <span className="font-semibold text-title inline-block">
                              {item?.quantity}
                            </span>
                          </p>
                          <p className="text-sm text-title !my-3 font-bold">Options</p>
                          {item?.options?.map((option: any) => (
                            <p className="text-sm text-sub-content grid grid-cols-2 gap-2">
                              <span
                                className="text-gray-500"
                                key={option?.id}
                              >
                                {option?.name}:
                              </span>
                              <span className="font-semibold text-title inline-block">
                                {option?.value?.name || '-'}
                              </span>
                            </p>
                          ))}
                          {/* End options */}
                          {item?.notes && (
                            <details className="cursor-pointer !mt-3">
                              <summary className="text-sm text-title">Notes</summary>
                              <p className="text-sm text-sub-content mt-2">{item?.notes}</p>
                            </details>
                          )}
                        </div>
                        <div className="space-y-1 hidden">
                          <p className="text-sm font-semibold text-gray-600">
                            {CurrencyFormatter(
                              Number(item?.product?.price || 0) -
                                Number(
                                  (order?.meta[item?.product?.salla_product_id]?.vendor_price ||
                                    0) * item?.quantity
                                )
                            )}
                          </p>
                          <p className="text-lg font-bold text-teal-600">
                            {CurrencyFormatter(item?.product?.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <ul className="mt-4 border-t border-t-ring-border pt-2">
                <li className="pt-2">
                  <div className="flex gap-4 items-start">
                    <div className="space-y-0.5 flex-1">
                      <p className="text-sm text-content font-semibold">Required amount</p>
                      <p className="text-sm text-red-500">
                        Amount included %{vat_value} VAT equal{' '}
                        {CurrencyFormatter(
                          parseFloat(
                            Number((unpaid_amount || 0) - (amount_included_vat || 0)).toFixed(2)
                          )
                        )}
                      </p>
                      <p className="text-sm text-red-500">
                        Amount included Shipping fees equal (
                        {CurrencyFormatter(order.shippingFee || 0)})
                      </p>
                    </div>
                    <p className="text-base font-bold text-title">
                      {CurrencyFormatter(totalUnpaidAmount + order.shippingFee)}
                    </p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      <Modal
        visible={statusVisible}
        title="Update status"
        handleClose={() => setStatusVisible(false)}
      >
        <Fragment>
          <UpdateStatusForm order={order} />
        </Fragment>
      </Modal>
      {/* <Modal
        visible={payVisible}
        title="Payment details"
        handleClose={() => setPayVisible(false)}
      >
        <Fragment>
          <PayForm />
        </Fragment>
      </Modal> */}
      <Modal
        visible={payVisible}
        handleClose={() => setPayVisible(false)}
        title={'#' + order?.reference_id}
      >
        <Fragment>
          <PlaceOrderForm
            item={order}
            unpaid_amount={totalUnpaidAmount}
          />
        </Fragment>
      </Modal>
    </Fragment>
  );
  function PlaceOrderForm({ item, unpaid_amount }: any) {
    const [disabled, setDisabled] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>();
    const handelChangeInput = (e:any,handleChange:any)=>{
      const inputValue = e.target.value;
      const englishLettersRegex = /^[A-Za-z0-9\s]+$/;
      if ( englishLettersRegex.test(inputValue))   {
        setErrors({})
        handleChange(e)
      }
      else  setErrors({[e?.target.name]:'Add Letters Only In English'})
      
    }
    const {
      formik: { handleSubmit, handleChange, values }
    } = useForm({ initialValues: { id: item?.id, notes: undefined }, submitHandler: SendOrder });
  
    async function SendOrder(val: any, helpers: any) {
      try {
        setDisabled(true);
        setErrors(undefined);
        const { data } = await axiosInstance.post('orders/pay-order', val);
        window.location.href = data.url;
      } catch (error: AxiosError | any) {
        const err = error.response;
        if (error instanceof AxiosError) {
          setErrors(err.data.message);
        }
      } finally {
        setDisabled(false);
      }
    }
  
    return (
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-600 mx-auto">
          <Icon
            icon="entypo:hour-glass"
            width={26}
            height={26}
          />
        </div>
        <div className="space-y-2">
          <p className="text-lg text-title font-semibold text-center">Send order</p>
          <p className="text-sm text-content font-medium text-center">
            The request will be sent to the administration first so that the necessary procedures for
            that request are followed and the required is verified, then you will be notified of the
            new, you must pay the next amount{' '}
            <span className="font-bold text-teal-600">{CurrencyFormatter(unpaid_amount + order.shippingFee|| 0)}</span>{' '}
            and verify first that that amount is already available on the credit card
          </p>
          <div className="form-group !my-4">
            <textarea
              name="notes"
              placeholder="Place order notes here.."
              className="form-textarea form-outline"
              value={values?.notes}
              onChange={(e)=>handelChangeInput(e,handleChange)}
            ></textarea>
          </div>
          {errors?.notes ? <p className="form-error text-center !block">{errors?.notes}</p> : null}
        </div>
        <div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="btn-with-icon !text-sm !bg-secondary flex-[fit-content]"
              type="submit"
              disabled={disabled}
            >
              Submit
            </button>
            <button
              className="btn-with-icon !text-sm outline-btn flex-[fit-content]"
              type="button"
              disabled={disabled}
              onClick={() => setPayVisible(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    );
  }
}


