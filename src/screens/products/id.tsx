import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from 'src/components/shared/Card';
import Image from 'src/components/shared/Image';
import LoadingComponent from 'src/components/shared/LoadingComponent';
import axiosInstance from 'src/helper/AxiosInstance';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import { Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.css';

function useHook() {
  let rerender: boolean = true;
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<any>({});

  useEffect(() => {
    if (!rerender) return;
    GetProductDetails();
    rerender = false;
  }, []);

  async function GetProductDetails() {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('products/v1/' + id);
      setProduct(data);
      console.log(data)
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, product };
}

export default function id() {
  const { isLoading, product } = useHook();
  if (isLoading) return <LoadingComponent />;

  return (
    <div className="p-8 pt-2 space-y-4">
      <div className="w-full flex flex-col xl:flex-row gap-4">
        <div className="w-full xl:max-w-sm grid">
          <Card className="w-full">
            <Swiper
              autoHeight
              autoplay={{ delay: 5000 }}
              modules={[Autoplay]}
              slidesPerView={1}
            >
              {product.images?.map((image: any, index: number) => (
                <SwiperSlide key={index}>
                  <Image
                    src={image.original}
                    className="w-full"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </Card>
        </div>
        <div className="w-full space-y-4 flex-1 grid">
          <Card>
            <p className="text-2xl font-bold text-title">{product.name}</p>

            <div className=" py-4 border-y border-y-gray-200 !my-6">
              <ul className="w-full max-w-xs grid grid-cols-2 gap-2">
                <li>
                  <p className="text-sm text-gray-500">SKU</p>
                </li>
                <li>
                  <p className="text-sm text-title">{product.sku}</p>
                </li>
                <li>
                  <p className="text-sm text-gray-500">Main price</p>
                </li>
                <li>
                  <p className="text-sm text-title">{CurrencyFormatter(product.main_price)}</p>
                </li>
                <li>
                  <p className="text-sm text-gray-500">Price</p>
                </li>
                <li>
                  <p className="text-sm text-title">{CurrencyFormatter(product.price)}</p>
                </li>
                <li>
                  <p className="text-sm text-gray-500">Commission</p>
                </li>
                <li>
                  <p className="text-sm text-title">
                    {product.vendor_commission}% {CurrencyFormatter(product.vendor_price)}
                  </p>
                </li>
                <li>
                  <p className="text-sm text-gray-500">Quantity</p>
                </li>
                <li>
                  <p className="text-sm text-title">{product.quantity}</p>
                </li>
                <li>
                  <p className="text-sm text-gray-500">Original product</p>
                </li>
                <li>
                  <Link
                    to={'https://aliexpress.com/item/' + product.original_product_id + '.html'}
                    className="text-xs font-medium bg-primary text-white rounded py-2 px-4"
                  >
                    View AE product
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              {product?.options?.map((option: any, index: number) => (
                <div
                  className="space-y-3"
                  key={index}
                >
                  <p className="text-title font-semibold">{option.name}</p>
                  <ul className="flex items-center flex-wrap gap-2">
                    {option.values?.map((value: any, idx: number) => (
                      <li
                        className="shrink-0"
                        key={idx}
                      >
                        <p className="text-sm font-medium text-gray-600 bg-gray-100 rounded py-2 px-4">
                          {value.name}{' '}
                          {value.original_price !== value.price ? (
                            <span className="line-through text-gray-400">
                              {CurrencyFormatter(value.original_price)}
                            </span>
                          ) : null}{' '}
                          <span>{CurrencyFormatter(value.price)}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div
              className="text-sm text-gray-500"
              dangerouslySetInnerHTML={{ __html: product.description }}
            ></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
