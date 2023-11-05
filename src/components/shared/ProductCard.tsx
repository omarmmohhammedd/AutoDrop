import { Icon } from '@iconify/react';
import moment from 'moment';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import generateAlert from 'src/helper/generateAlert';
import prepareRequest from 'src/helper/prepareRequest';
import Card from './Card';
import Image from './Image';

export default function ProductCard({ product }: { product: any }) {
  const diff = moment().diff(moment(product.createdAt), 'day');
  const [disabled, setDisabled] = useState<boolean>(false);

  function deleteProduct() {
    setDisabled(true);
    prepareRequest(
      {
        url: 'salla/products/delete',
        method: 'post',
        data: { id: product.id }
      },
      (data) => {
        generateAlert(data.message, 'success');
      }
    ).finally(() => {
      setDisabled(false);
    });
  }

  return (
    <Card className="!p-0">
      <div className="flex flex-col group transition relative">
        {diff < 1 && (
          <span className="text-xs text-white bg-blue-600 py-1.5 px-2 rounded font-medium absolute top-0 m-4 z-[1]">
            NEW
          </span>
        )}
        <Image
          alt={product.product?.name}
          className="w-full h-full flex-1 object-cover"
          src={product.product?.images[0]?.original}
        />
        <div className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              {/* <p className="text-lg font-bold">{CurrencyFormatter(product.main_price)}</p> */}
              <Link
                to={'/products/' + product.id}
                className="text-sm font-medium text-gray-500 line-clamp-2 hover:underline transition"
              >
                {product.product?.name}
              </Link>
            </div>
            <button
              type="button"
              className="text-red-500"
              onClick={deleteProduct}
              disabled={disabled}
            >
              <Icon
                icon="mi:delete"
                width="20"
                height="20"
              />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
