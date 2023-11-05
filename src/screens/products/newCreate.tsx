import { Icon } from '@iconify/react';
import { useMemo, useState } from 'react';
import Card from 'src/components/shared/Card';
import CenterLoading from 'src/components/shared/CenterLoading';
import Editor from 'src/components/shared/Editor';
import Image from 'src/components/shared/Image';
import Instructions from 'src/components/shared/Instructions';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import generateAlert from 'src/helper/generateAlert';
import prepareRequest from 'src/helper/prepareRequest';
import useForm from 'src/hooks/useForm';
import { v4 as uuid } from 'uuid';

export default function newCreate() {
  return (
    <div className="space-y-6 p-6">
      <GetAliExpressProductDetails />
    </div>
  );
}

function GetAliExpressProductDetails() {
  const [disabled, setDisabled] = useState<boolean>(false);
  const [product, setProduct] = useState<any>(undefined);

  const {
    formik: { values, handleSubmit, handleChange }
  } = useForm({
    initialValues: {
      url: 'https://ar.aliexpress.com/item/1005001930691014.html'
    },
    submitHandler(values, formikHelpers) {
      console.log(values);
      setDisabled(true);
      setProduct(undefined);
      prepareRequest(
        {
          method: 'post',
          url: 'ae/products/get',
          data: values
        },
        (response, error) => {
          const res = response.result?.product || {};
          const options = res.options?.map((option: any) => {
            const values = option.values.map((val: any) => ({
              ...val,
              original_price: val.price
            }));

            return {
              ...option,
              values
            };
          });
          generateAlert(response.message, 'success');
          setProduct(() => ({
            ...res,
            options
          }));
        }
      ).finally(() => setDisabled(false));
    }
  });
  return (
    <>
      <form
        className="space-y-6 grid pt-6 pb-12 border-b border-b-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2 text-center">
          <p className="text-2xl font-bold">Get product details</p>
          <p className="text-gray-600">
            Enter item URL to get product details such as name, description, options, image ..etc.
          </p>
        </div>
        <div className="flex gap-4">
          <input
            type="url"
            name="url"
            id="url"
            className="form-input shrink-0 flex-1"
            placeholder="http(s)://aliexpress.com/item/123456789"
            required
            value={values.url}
            onChange={handleChange}
            disabled={disabled}
          />
          <button
            className="py-3 px-4 rounded bg-primary text-white text-sm shrink-0"
            type="submit"
            disabled={disabled}
          >
            <span>Send</span>
          </button>
        </div>
      </form>
      {product ? (
        <div>
          <CreateProductForm product={product} />
        </div>
      ) : null}
    </>
  );
}

function CreateProductForm({ product }: { product: any }) {
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>({});

  const {
    formik: { values, handleSubmit, handleChange, setFieldValue }
  } = useForm({
    initialValues: product,
    submitHandler(values, formikHelpers) {
      setDisabled(true);
      setErrors({});
      prepareRequest(
        {
          method: 'post',
          url: 'salla/products/create',
          data: values
        },
        (response, error) => {
          if (error) return setErrors(() => error);
          generateAlert(response.message, 'success');
          console.log(response);
        }
      ).finally(() => setDisabled(false));
    }
  });

  function generateNewSku() {
    const sku = uuid();
    setFieldValue('sku', sku);
  }

  function removeImage(src: any) {
    const filterImages = values.images.filter((img: any) => img.original !== src);
    setFieldValue('images', filterImages);
  }

  function removeOption(id: string | number) {
    const result = values.options.filter((e: any, index: number | string) => index !== id);
    setFieldValue('options', result);
  }

  function removeValue(value: string | number, option: string | number) {
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
  }
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
  return (
    <>
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <div className="flex gap-4 flex-col xl:flex-row">
          <div className="flex-1 w-full space-y-4">
            <p className="form-label">Basic information</p>

            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group col-span-full">
                  <p className="form-label">Name</p>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="..."
                    className="form-input"
                    required
                    value={values.name}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                  <p className="form-error"></p>
                </div>

                <div className="form-group col-span-full">
                  <div>
                    <Instructions
                      Label={() => <p className="form-label">Profit commission</p>}
                      Body={() => (
                        <div className="space-y-3">
                          <p className="form-label">
                            Our platform commission is{' '}
                            <span className="font-semibold text-red-500">7%</span> for each product,
                            this commission is applied to the entire product whether the product
                            includes options or without, it is preferable to use a product with
                            options to help you more during purchases.
                          </p>
                          <p className="form-label">
                            For example, if the price of the basic product is{' '}
                            <span className="font-semibold text-blue-500">
                              {CurrencyFormatter(150)}
                            </span>{' '}
                            and you want the selling price to be{' '}
                            <span className="font-semibold text-blue-500">
                              {CurrencyFormatter(180)}
                            </span>{' '}
                            , the platform’s commission will become{' '}
                            <span className="font-semibold text-red-500">
                              {CurrencyFormatter(2.1)}
                            </span>{' '}
                            , and your commission will be{' '}
                            <span className="font-semibold text-blue-500">
                              {CurrencyFormatter(27.9)}
                            </span>{' '}
                            .
                          </p>
                          <p className="form-label">
                            The difference between the basic price and the selling price is
                            converted into a percentage to be added to all options to calculate the
                            profit result from each option.
                          </p>
                        </div>
                      )}
                    />
                  </div>

                  <input
                    type="number"
                    name="vendor_commission"
                    id="vendor_commission"
                    placeholder="00.0"
                    className="form-input"
                    required
                    autoComplete="off"
                    value={values.vendor_commission}
                    onChange={handleChange}
                    min={0}
                    onBlur={(ev) => {
                      const { valueAsNumber } = ev.target;
                      setFieldValue(
                        'vendor_commission',
                        valueAsNumber >= 100 ? 100 : valueAsNumber <= 0 ? 0 : valueAsNumber
                      );
                    }}
                  />

                  <p className="form-error"></p>
                </div>
              </div>
            </Card>
            <p className="form-label">Options</p>
            <Card>
              <div className="space-y-4">
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
              </div>
            </Card>
            <p className="form-label">Images</p>
            <Card>
              <div className="grid grid-wrapper gap-4">
                {values.images.map((image: any, index: any) => (
                  <div
                    className="flex flex-col relative"
                    key={index}
                  >
                    <Image
                      src={image.original}
                      alt={image.original}
                      className="w-full h-full object-cover flex-1"
                    />
                    <button
                      type="button"
                      className="text-center bg-red-500 text-xs font-medium flex items-center justify-center gap-2 absolute top-0 m-3 py-2 px-3 rounded-full text-white border-2 border-white"
                      onClick={() => removeImage(image.original)}
                    >
                      <Icon
                        icon="mdi:remove"
                        width="16"
                        height="16"
                      />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            </Card>
            <p className="form-label">Description</p>
            <Card>
              <Editor
                value={values.description}
                onChange={(value) => setFieldValue('description', value)}
              />
            </Card>
          </div>
          <div className="flex-1 xl:max-w-md w-full space-y-4">
            <p className="form-label">Product SEO</p>
            <Card>
              <div className="spacey-y-4">
                <div className="form-group ">
                  <p className="form-label">Title</p>
                  <input
                    type="text"
                    name="metadata_title"
                    id="metadata_title"
                    placeholder="..."
                    className="form-input"
                    autoComplete="off"
                    value={values.metadata_title}
                    onChange={handleChange}
                  />
                  <p className="form-error"></p>
                </div>
                <div className="form-group ">
                  <p className="form-label">Description</p>
                  <textarea
                    name="metadata_description"
                    id="metadata_description"
                    placeholder="..."
                    className="form-textarea"
                    autoComplete="off"
                    value={values.metadata_description}
                    onChange={handleChange}
                  ></textarea>
                  <p className="form-error"></p>
                </div>
              </div>
            </Card>
            <button
              className="btn-with-icon p-3 bg-primary !text-sm !w-full"
              type="submit"
              disabled={disabled}
            >
              <span>Save changes</span>
            </button>
          </div>
        </div>
      </form>
      {disabled ? <CenterLoading /> : null}
    </>
  );
}
