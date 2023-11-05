import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';
import useForm from 'src/hooks/useForm';

interface FormInterface {
  name: string | undefined;
  description: string | undefined;
  price: number | undefined;
  discount_value: number | undefined;
  discount_type: string | undefined;
  orders_limit: number | undefined;
  products_limit: number | undefined;
  is_monthly: boolean;
  is_default: boolean;
}

export default function create() {
  const globalValues = {
    name: undefined,
    description: undefined,
    price: undefined,
    discount_value: 0,
    discount_type: 'fixed',
    orders_limit: undefined,
    products_limit: undefined,
    is_monthly: true,
    is_default: false
  } satisfies FormInterface;
  const [errors, setErrors] = useState<any>();
  const [initialValues, setInitialValues] = useState<FormInterface>(globalValues);
  const [disabled, setDisabled] = useState<boolean>(false);
  const alert = useAlert();
  const navigate = useNavigate();

  async function CreatePlan(values: any, helpers: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      //console.table(values);
      const { data } = await axiosInstance.post('plans/add', values);
      alert.show({
        text: data?.message,
        visible: true
      });
      helpers.resetForm();
      navigate('/plans', { replace: true });
    } catch (error: AxiosError | any) {
      const err = error.response;
      const _errors = err?.data?.message;

      if (_errors) {
        setErrors(_errors);
      }
    } finally {
      setDisabled(false);
    }
  }

  const {
    formik: { handleSubmit, handleChange, values, setFieldValue }
  } = useForm({ initialValues, submitHandler: CreatePlan });

  return (
    <div className="p-8 pt-2 space-y-4">
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            className="form-input form-outline"
            placeholder="..."
            value={values.name}
            onChange={handleChange}
          />
          {errors?.name ? <span className="form-error">{errors?.name}</span> : null}
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            id="description"
            className="form-textarea form-outline"
            placeholder="..."
            value={values.description}
            onChange={handleChange}
          ></textarea>
          {errors?.description ? <span className="form-error">{errors?.description}</span> : null}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Orders limit</label>
            <input
              type="number"
              name="orders_limit"
              id="orders_limit"
              className="form-input form-outline"
              placeholder="..."
              value={values.orders_limit}
              onChange={handleChange}
            />
            {errors?.orders_limit ? (
              <span className="form-error">{errors?.orders_limit}</span>
            ) : null}
          </div>
          <div className="form-group">
            <label className="form-label">Products limit</label>
            <input
              type="text"
              name="products_limit"
              id="products_limit"
              className="form-input form-outline"
              placeholder="..."
              value={values.products_limit}
              onChange={handleChange}
            />
            {errors?.products_limit ? (
              <span className="form-error">{errors?.products_limit}</span>
            ) : null}
          </div>
        </div>
        <div className="form-group">
          <div className="flex gap-4 items-center py-3 px-4 rounded-lg bg-gray-100">
            <input
              type="checkbox"
              name="is_default"
              id="is_default"
              className="form-checkbox"
              checked={values.is_default}
              onChange={handleChange}
            />
            <label
              htmlFor="is_default"
              className="form-label cursor-pointer space-y-0.5"
            >
              <p className="text-title font-semibold text-base">Mark as default</p>
              <p className="text-sm text-gray-500">
                In case this plan will be default, that plan will become without pricing, and then
                another plan will be chosen by the vendor after completing the number of allowed
                orders and products
              </p>
            </label>
          </div>
          {!values.is_default ? (
            <>
              <div className="flex gap-3 items-center">
                <input
                  type="radio"
                  name="plan-type"
                  id="monthly"
                  className="form-radio"
                  checked={values.is_monthly}
                  onChange={() => setFieldValue('is_monthly', true)}
                />
                <label
                  htmlFor="monthly"
                  className="form-label cursor-pointer"
                >
                  Monthly
                </label>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="radio"
                  name="plan-type"
                  id="yearly"
                  className="form-radio"
                  checked={!values.is_monthly}
                  onChange={() => setFieldValue('is_monthly', false)}
                />
                <label
                  htmlFor="yearly"
                  className="form-label cursor-pointer"
                >
                  Yearly
                </label>
              </div>
              {errors?.is_monthly ? <span className="form-error">{errors?.is_monthly}</span> : null}
            </>
          ) : null}
          {errors?.is_default ? <span className="form-error">{errors?.is_default}</span> : null}
        </div>
        {!values.is_default ? (
          <>
            <div className="form-group">
              <label className="form-label">Price</label>
              <input
                type="number"
                name="price"
                id="price"
                className="form-input form-outline"
                placeholder="..."
                value={values.price}
                onChange={handleChange}
              />
              {errors?.price ? <span className="form-error">{errors?.price}</span> : null}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Discount type</label>
                <select
                  name="discount_type"
                  id="discount_type"
                  className="form-input form-outline"
                  defaultValue=""
                  value={values.discount_type}
                  onChange={handleChange}
                >
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percentage</option>
                </select>
                {errors?.discount_type ? (
                  <span className="form-error">{errors?.discount_type}</span>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">Discount value</label>
                <input
                  type="number"
                  name="discount_value"
                  id="discount_value"
                  className="form-input form-outline"
                  placeholder="..."
                  value={values.discount_value}
                  onChange={handleChange}
                />
                {errors?.discount_value ? (
                  <span className="form-error">{errors?.discount_value}</span>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        <button
          className="btn-with-icon bg-secondary !text-sm"
          type="submit"
          disabled={disabled}
        >
          <span>Submit</span>
        </button>
      </form>
    </div>
  );
}
