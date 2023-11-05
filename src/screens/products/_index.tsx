import { Icon } from '@iconify/react';
import { AxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Image from 'src/components/shared/Image';
import Select from 'src/components/shared/Select';
import SharedTime from 'src/components/shared/SharedTime';
import Table from 'src/components/shared/tables';
import axiosInstance from 'src/helper/AxiosInstance';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import { ConfirmAlert, useAlert } from 'src/hooks/alerts';
import useProductsHooks from 'src/hooks/products';
import useForm from 'src/hooks/useForm';
import { RootState } from 'src/store';

export default function index() {
  let rerender: boolean = true;
  const { pagination, isLoading, products, GetProducts, users } = useProductsHooks();
  const { user } = useSelector((state: RootState) => state.auth);
  const alert = useAlert();
  const [filter, setFilter] = useState<any>({});
  const [disabled, setDisabled] = useState<boolean>(false);

  // useEffect(() => {
  //   if (rerender) {
  //     Promise.all([GetProducts()]).finally(() => setIsLoading(false));
  //     rerender = false;
  //   }
  // }, []);

  async function DeleteItem(id: string) {
    try {
      const { data } = await axiosInstance.post('products/v1/delete', { id });
      alert.show({
        text: data?.message,
        visible: true
      });
      await GetProducts();
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

  async function handleFilterSubmit(values: any) {
    try {
      setDisabled(true);
      console.log(values);
      await GetProducts(values);
    } catch (error) {
    } finally {
      setDisabled(false);
    }
  }

  const MEMO_TABLE = useMemo(() => {
    return (
      <Table
        RenderHead={() => {
          return (
            <tr>
              <th>Product</th>
              {user?.userType === 'admin' && <th>Vendor</th>}
              <th>SKU</th>
              <th>AliExpress product</th>
              <th>Store product</th>
              <th>Quantity</th>
              <th>Original price</th>
              <th>Display price</th>
              <th>Commission</th>
              <th>Added date</th>
              <th>Actions</th>
            </tr>
          );
        }}
        RenderBody={() => {
          return (
            <>
              {products.map((item, i) => {
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
        title={'Products table'}
        isEmpty={!products?.length}
        pagination={pagination}
        searchProps={{
          defaultValue: pagination.search_key,
          onKeyDown: ({ key, target }: any) => {
            if (key === 'Enter') {
              GetProducts({
                search_key: target.value
              });
            }
          }
        }}
        onNextClick={() => GetProducts({ page: pagination.page + 1 })}
        onPreviousClick={() => GetProducts({ page: pagination.page - 1 })}
        loading={isLoading}
      />
    );
  }, [pagination, isLoading, products]);

  const {
    formik: { handleSubmit, handleChange, values, setFieldValue, resetForm }
  } = useForm({ initialValues: filter, submitHandler: handleFilterSubmit });

  return (
    <div className="p-8 pt-2 space-y-4">
      <form
        className="grid grid-wrapper gap-4"
        onSubmit={handleSubmit}
        onReset={() => {
          resetForm();
          handleSubmit();
        }}
      >
        {user?.userType === 'admin' && (
          <div className="form-group">
            <label
              htmlFor="vendor"
              className="form-label"
            >
              Vendor
            </label>
            <Select
              type="single"
              optionTxt="name"
              optionValue="id"
              value={values?.vendor}
              onSelect={(val) => setFieldValue('vendor', val)}
              options={users}
            />
          </div>
        )}
        <div className="form-group">
          <label
            htmlFor="min_price"
            className="form-label"
          >
            Min price
          </label>
          <input
            type="number"
            name="min_price"
            id="min_price"
            className="form-input form-outline"
            placeholder="1"
            min={1}
            value={values?.min_price}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label
            htmlFor="max_price"
            className="form-label"
          >
            Max price
          </label>
          <input
            type="number"
            name="max_price"
            id="max_price"
            className="form-input form-outline"
            placeholder="1"
            min={values?.min_price || 1}
            value={values?.max_price}
            onChange={handleChange}
          />
        </div>
        <div className="col-span-full">
          <div className="inline-flex gap-2">
            <button
              className="btn-with-icon bg-primary"
              type="submit"
              disabled={disabled}
            >
              Apply
            </button>
            <button
              className="btn-with-icon bg-gray-100 !text-gray-600"
              type="reset"
              disabled={disabled}
              // onClick={(e: any) => {
              //   resetForm();
              // }}
            >
              Clear
            </button>
          </div>
        </div>
      </form>
      <div>
        <div className="table-actions">
          <Link
            to="/products/add"
            className="btn-with-icon outline-btn !text-content !text-sm"
          >
            <Icon
              icon="material-symbols:add-rounded"
              width={15}
              height={15}
            />
            <span>Add new product</span>
          </Link>
        </div>
      </div>

      {MEMO_TABLE}
    </div>
  );
}

function DisplayTableItem({ item, DeleteItem }: any) {
  const defaultImage = useMemo(() => {
    return item?.images?.find((img: any) => img.default) || item?.images?.[0];
  }, [item]);

  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <tr>
      <td>
        <Link
          to={{
            pathname: '/products/' + item.id
          }}
          title={item.name || 'View product details'}
          className="inline-flex gap-4 items-start w-screen max-w-xs"
        >
          <Image
            src={defaultImage?.original}
            className="w-12 h-12 rounded-lg object-cover border border-ring-border shrink-0"
          />
          <div className="flex-1 space-y-1">
            <p className="text-sm text-sky-500 !whitespace-normal line-clamp-2">
              {item.name || 'N/A'}
            </p>
            {/* <p className="text-sm text-sub-content !whitespace-normal line-clamp-1">
                          {products.sku}
                        </p> */}
          </div>
        </Link>
      </td>
      {user?.userType === 'admin' && (
        <td>
          <div className="inline-flex gap-4 items-start w-screen max-w-xs">
            <Image
              src={item?.userId?.avatar}
              className="w-12 h-12 rounded-lg object-cover border border-ring-border shrink-0"
            />
            <div className="flex-1 space-y-1">
              <p className="text-sm text-sky-500 !whitespace-normal line-clamp-2">
                {item?.userId?.name || 'N/A'}
              </p>
              <p className="text-sm text-sub-content !whitespace-normal line-clamp-1">
                {item?.userId?.email}
              </p>
            </div>
          </div>
        </td>
      )}
      <td>{item.sku || 'N/A'}</td>
      <td>
        <Link
          to={'https://aliexpress.com/item/' + item.original_product_id + '.html'}
          target="_blank"
          className="text-red-500 underline"
        >
          <span>{item.original_product_id}</span>
        </Link>
      </td>
      <td>{item.store_product_id || 'N/A'}</td>
      <td>{item.quantity || 'N/A'}</td>
      <td>{CurrencyFormatter(item.main_price || 0)}</td>
      <td>{CurrencyFormatter(item.price || 0)}</td>
      <td>
        {CurrencyFormatter(item.vendor_price || 0)} {item?.vendor_commission?.toFixed(2)}%
      </td>
      <td>
        <SharedTime date={item.createdAt} />
      </td>
      <td>
        <div className="inline-flex gap-2">
          {/* <Link
            to={'/products/' + item.id}
            className="btn-with-icon outline-btn text-content w-fit"
          >
            <Icon
              icon="ri:eye-line"
              width={15}
              height={15}
            />
          </Link>
          <button className="btn-with-icon outline-btn">
            <span>Update</span>
          </button> */}
          <button
            className="btn-with-icon bg-red-500"
            onClick={() => setDeleteConfirm(true)}
          >
            <span>Delete</span>
          </button>
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
  );
}
