import { Icon } from '@iconify/react';
import { queries } from '@testing-library/react';
import axios, { AxiosError } from 'axios';
import React, {
  ChangeEvent,
  Fragment,
  HTMLAttributes,
  HtmlHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Alert from 'src/components/shared/Alert';
import Card from 'src/components/shared/Card';
import Editor from 'src/components/shared/Editor';
import Image from 'src/components/shared/Image';
import Modal from 'src/components/shared/Modal';
import Select from 'src/components/shared/Select';
import axiosInstance from 'src/helper/AxiosInstance';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import { useAlert } from 'src/hooks/alerts';
import useForm from 'src/hooks/useForm';
import { RootState } from 'src/store';

export default function create() {
  const [initialValues, setInitialValues] = useState<any>();
  const [hasData, setHasData] = useState<boolean>(false);

  return (
    <div className="p-8 pt-2 space-y-4">
      <GetProductDetails
        setHasData={setHasData}
        setProduct={setInitialValues}
      />
      {initialValues ? <DisplayProductFields product={initialValues} /> : null}

      {/* <DisplayProductFields product={initialValues} /> */}
    </div>
  );
}

function GetProductDetails({ setHasData, setProduct }: any) {
  const [errors, setErrors] = useState<any>();
  const [initialValues, setInitialValues] = useState<any>({
    url: 'https://ar.aliexpress.com/item/1005001930691014.html'
  });
  const [disabled, setDisabled] = useState<boolean>(false);
  const alert = useAlert();

  async function GetProductData(values: any) {
    try {
      setDisabled(true);
      setProduct();
      const { data } = await axiosInstance.post('products/v1/get-details', values);
      setProduct({ ...data, skus: [] });
      setHasData(true);
    } catch (error: AxiosError | any) {
      const err = error?.response?.data;
      if (err) {
        if (err.message instanceof Object) return setErrors(err.message);
        console.log(err)
        alert.show({
          text: err?.message,
          visible: true
        });
      }
      // console.log(error)
    } finally {
      setDisabled(false);
    }
  }

  const {
    formik: { handleSubmit, handleChange, values }
  } = useForm({ initialValues, submitHandler: GetProductData });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <Card>
        <div className="form-group">
          <label className="form-label">Product URL</label>
          <div className="flex gap-4 items-scratch">
            <input
              type="url"
              id="url"
              autoComplete="off"
              className="form-input flex-1"
              placeholder="https://www.aliexpress.com/item/123456789.(htm|html)"
              value={values.url}
              name="url"
              onChange={handleChange}
              disabled={disabled}
            />
            {errors?.url ? <span className="form-error">{errors?.url}</span> : null}

            <button
              className="btn-with-icon bg-secondary !px-4"
              disabled={disabled}
            >
              Send
            </button>
          </div>
        </div>
      </Card>
    </form>
  );
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  main_price: number;
  quantity: number;
  sku: string;
  images: any[] | null;
  options: any[] | null;
  metadata_title: string;
  metadata_description: string;
  merchant: undefined;
  skus: string[];
}

function DisplayProductFields({ product }: any) {
  const [errors, setErrors] = useState<any>();
  const [initialValues, setInitialValues] = useState<ProductForm>(product);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [result, setResult] = useState<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    formik: { handleSubmit, handleChange, values, setFieldValue }
  } = useForm({ initialValues, submitHandler: CreateProduct });
  const collectValues = useMemo(
    () => new Array().concat(...values.options.map((option: any) => option.values)),
    [values.options]
  );

  useEffect(() => {
    if (user?.userType === 'admin') {
      GetUsers();
    }
  }, []);

  async function GetUsers() {
    try {
      const { data } = await axiosInstance.get('auth/users', { params: { userType: 'vendor' } });
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function CreateProduct(values: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('products/v1/create', values);
      console.log(data)
      // navigate('/products', { replace: true });
      setResult(data?.result?.urls);
      setVisible(true);
    } catch (error: AxiosError | any) {
      const err = error.response;
      const _errors = err?.data?.message?.error?.fields;

      if (_errors) return setErrors(Object.values(_errors));
      setErrors(err?.data?.message);
    } finally {
      setDisabled(false);
    }
  }

  const GetPriceFromCommission = useMemo(() => {
    let total: number = 0,
      quantities: number = 0;
    const { vendor_commission } = values;

    total = collectValues[0]?.original_price || 0;

    const commissionPrice = total * ((vendor_commission || 0) / 100);
    const price = parseFloat((total + commissionPrice).toFixed(2));

    setFieldValue('price', price);
    return commissionPrice;
  }, [values.vendor_commission, values.skus]);

  const UpdateOptionsValuesPrice = useMemo(() => {
    const { options, vendor_commission } = values;
    const _vendor_commission = vendor_commission || 0;

    const _options = options?.map((option: any) => {
      const values = option.values;
      return {
        ...option,
        values: values?.map((val: any) => {
          const valPrice = val.original_price || 0;
          const priceWithCommission = valPrice + (valPrice * _vendor_commission) / 100;
          return {
            ...val,
            price: priceWithCommission || valPrice
          };
        })
      };
    });

    setFieldValue('options', _options);
  }, [values.vendor_commission]);

  const removeOption = useCallback(
    (id: string | number) => {
      const result = values.options.filter((e: any, index: number | string) => index !== id);
      setFieldValue('options', result);
    },
    [values.options]
  );

  const removeValue = useCallback(
    (value: string | number, option: string | number) => {
      const result = values.options.map((e: any, index: number | string) => {
        const isSame = index == option;
        const values = e.values.filter((v: any, idx: number | string) => idx !== value);
        if (isSame) {
          return {
            ...e,
            values
          };
        }
        return e;
      });

      setFieldValue('options', result);
    },
    [values.options]
  );

  return (
    <Fragment>
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start gap-4">
          {/* <Card className="w-full max-w-sm shrink-0"></Card> */}
          <div className="flex-1 space-y-4 shrink-0">
            {errors ? <Alert content={JSON.stringify(errors, null, 2)} /> : null}
            <Card className="space-y-4">
              {user?.userType === 'admin' ? (
                <div className="form-group">
                  <label className="form-label">Vendor</label>

                  <Select
                    type="single"
                    optionTxt="name"
                    optionValue="id"
                    value={values?.merchant}
                    onSelect={(val) => setFieldValue('merchant', val)}
                    options={users}
                  />
                  {errors?.merchant ? <span className="form-error">{errors?.merchant}</span> : null}
                </div>
              ) : null}
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  autoComplete="off"
                  className="form-input"
                  placeholder="..."
                  value={values?.name}
                  name="name"
                  onChange={handleChange}
                  required
                />
                {errors?.name ? <span className="form-error">{errors?.name}</span> : null}
              </div>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input
                  type="text"
                  id="sku"
                  autoComplete="off"
                  className="form-input"
                  placeholder={values?.sku}
                  name="sku"
                  disabled
                  readOnly
                  required
                />
                {errors?.sku ? <span className="form-error">{errors?.sku}</span> : null}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group sm:col-span-2">
                  <label className="form-label">Commission (%)</label>
                  <input
                    type="number"
                    id="vendor_commission"
                    autoComplete="off"
                    className="form-input"
                    placeholder="..."
                    value={values?.vendor_commission}
                    name="vendor_commission"
                    onChange={handleChange}
                    min={0}
                    max={100}
                    step="any"
                    required
                  />
                  <p className="text-gray-500 text-sm">
                    The earning from this product based on selected options value price{' '}
                    <span className="text-teal-600">{JSON.stringify(values.value_skus)}</span> as
                    default will be{' '}
                    <span className="text-teal-600">
                      {CurrencyFormatter(GetPriceFromCommission)}
                    </span>{' '}
                  </p>
                  {errors?.vendor_commission ? (
                    <span className="form-error">{errors?.vendor_commission}</span>
                  ) : null}
                </div>
                <div className="form-group">
                  <label className="form-label">Price (SAR)</label>
                  <input
                    type="number"
                    id="price"
                    autoComplete="off"
                    className="form-input"
                    placeholder={values?.price}
                    name="price"
                    disabled
                    readOnly
                    required
                  />
                  {errors?.price ? <span className="form-error">{errors?.price}</span> : null}
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    autoComplete="off"
                    className="form-input"
                    placeholder={values?.quantity}
                    name="quantity"
                    disabled
                    readOnly
                    required
                  />
                  {errors?.quantity ? <span className="form-error">{errors?.quantity}</span> : null}
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <p className="text-lg font-semibold text-content">Options</p>
              <p className="text-sm font-medium text-content bg-content/10 rounded py-2 px-3">
                All options values price includes a commission that added above{' '}
                <span className="text-teal-600">{CurrencyFormatter(GetPriceFromCommission)}</span>
              </p>
              {values?.options?.map((option: any, index: number) => {
                return (
                  <div
                    className="space-y-3"
                    key={'option-' + index}
                  >
                    <div className="flex items-center gap-4 justify-between">
                      <p className="text-sm text-gray-600">{option.name}</p>
                      <button
                        type="button"
                        className="btn-with-icon !text-red-500 !p-0 self-start"
                        onClick={() => removeOption(index)}
                      >
                        <Icon
                          icon="fluent:delete-12-filled"
                          width="16"
                        />
                        <span>Remove</span>
                      </button>
                    </div>
                    <ul className="grid grid-wrapper gap-2">
                      {option.values.map((val: any, idx: number) => (
                        <li
                          key={'value-' + index + '-' + idx}
                          className="py-3 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer flex-[fit-content]"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="flex-1">
                              <div className="flex items-start gap-2 justify-between">
                                <p className="text-sm font-semibold">{val.name}</p>
                                <p className="text-sm font-semibold">{val.quantity || 0} (QTY)</p>
                              </div>
                              <p className="text-xs text-gray-600">
                                <span>{CurrencyFormatter(val.price)}</span>{' '}
                                {val.price !== val.original_price && (
                                  <span className="text-red-500 line-through">
                                    {CurrencyFormatter(val.original_price)}
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="btn-with-icon !text-red-500 !p-0 self-start"
                              onClick={() => removeValue(idx, index)}
                            >
                              <Icon
                                icon="fluent:delete-12-filled"
                                width="18"
                              />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </Card>

            <Card className="space-y-4">
              <p className="text-lg font-semibold text-content">Images</p>
              <ul className="grid grid-wrapper gap-4">
                {values?.images?.map((image: any, i: number) => (
                  <DisplayImage
                    item={image}
                    key={i}
                    index={i}
                    onChange={({ target }: any) => {
                      setFieldValue(
                        'images',
                        values?.images?.map((ev: any, idx: number) => {
                          return {
                            ...ev,
                            default: idx === i ? true : false
                          };
                        })
                      );
                    }}
                  />
                ))}
              </ul>
            </Card>

            <Card className="space-y-4">
              <div className="form-group">
                <label className="form-label">Description</label>
                <Editor
                  value={values?.description}
                  onChange={handleChange}
                />
                {errors?.description ? (
                  <span className="form-error">{errors?.description}</span>
                ) : null}
              </div>
            </Card>
            <Card className="space-y-4">
              <p className="text-lg font-semibold text-content">SEO Settings</p>
              <div className="form-group">
                <label className="form-label">SEO title</label>
                <input
                  type="text"
                  autoComplete="off"
                  className="form-input"
                  placeholder="..."
                  value={values?.metadata_title}
                  name="metadata_title"
                  onChange={handleChange}
                  required
                />
                {errors?.metadata_title ? (
                  <span className="form-error">{errors?.metadata_title}</span>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">SEO description</label>
                <textarea
                  autoComplete="off"
                  className="form-input"
                  placeholder="..."
                  value={values?.metadata_description}
                  name="metadata_description"
                  onChange={handleChange}
                  required
                ></textarea>
                {errors?.metadata_description ? (
                  <span className="form-error">{errors?.metadata_description}</span>
                ) : null}
              </div>
            </Card>
          </div>
        </div>
        <div className="w-full bottom-0 sticky z-10 bg-white p-4 border-t border-t-gray-200">
          <div className="inline-flex gap-3 flex-wrap">
            <button
              className="btn-with-icon bg-secondary !text-sm"
              type="submit"
              disabled={disabled}
            >
              <span>Save changes</span>
            </button>
          </div>
        </div>
      </form>

      <Modal
        visible={visible}
        handleClose={() => setVisible(false)}
        title="Congratulations"
      >
        <Fragment>
          <div className="space-y-6">
            <p className="text-sm font-medium text-gray-600">
              The product has been successfully added to the store under the name{' '}
              <span className="font-bold text-teal-600">{values?.name}</span> You can continue
              creating the rest of the products or visit the product through one of the following
              links
            </p>
            <div>
              <div className="inline-flex gap-2 items-center flex-wrap">
                <Link
                  to={result?.customer}
                  className="btn-with-icon bg-secondary"
                >
                  <span>View product in store</span>
                </Link>
                <Link
                  to={result?.admin}
                  className="btn-with-icon outline-btn text-gray-600"
                >
                  <span>View product in dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setVisible(false)}
                  className="btn-with-icon outline-btn text-gray-600"
                >
                  <span>Keep creating</span>
                </button>
              </div>
            </div>
          </div>
        </Fragment>
      </Modal>
    </Fragment>
  );
}

function DisplayImage({
  item,
  index,
  ...other
}: { item: any; index: number } & HTMLAttributes<HTMLInputElement>) {
  return (
    <li>
      <Card className="space-y-4 flex flex-col w-full h-full">
        <Image
          src={item?.original}
          className="w-full flex-1 rounded-xl object-center"
        />
        <div>
          <div className="inline-flex gap-3 items-center">
            <input
              type="radio"
              name="images-group"
              id={'image-group-' + index}
              className="form-radio"
              checked={item.default}
              {...other}
            />
            <label
              htmlFor={'image-group-' + index}
              className="form-label cursor-pointer"
            >
              Select as default
            </label>
          </div>
        </div>
      </Card>
    </li>
  );
}
