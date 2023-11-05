import { AxiosError } from 'axios';
import React, { useMemo, useState } from 'react';
import Select from 'src/components/shared/Select';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';
import useForm from 'src/hooks/useForm';

interface UpdateStatusForm {
  status: string | undefined;
  itemId: string | undefined;
  merchant: string | undefined;
  orderId: string | undefined;
}

export default function UpdateStatusForm({ order }: { order: any }) {
  const statues = ['created', 'in_review', 'in_transit', 'canceled', 'refuned', 'completed'];
  const statusIndex = useMemo(() => {
    return statues.findIndex((e) => e === order?.status) || 0;
  }, [order?.status]);
  const [errors, setErrors] = useState<any>();
  const [disabled, setDisabled] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<UpdateStatusForm>({
    status: order?.status,
    itemId: order?.tracking_order_id,
    merchant: order?.merchant,
    orderId: order?.id
  });
  const alert = useAlert();

  async function UpdateOrderStatus(values: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('orders/update-status', values);
      // navigate('/products', { replace: true });
      alert.show({
        text: data.message,
        visible: true
      });

      window.location.reload();
    } catch (error: AxiosError | any) {
      const err = error.response;
      const _errors = err?.data?.message;

      if (_errors instanceof Object) return setErrors(_errors);

      alert.show({
        text: _errors,
        visible: true
      });
    } finally {
      setDisabled(false);
    }
  }

  const {
    formik: { handleSubmit, handleChange, values, setFieldValue }
  } = useForm({ initialValues, submitHandler: UpdateOrderStatus });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label
          htmlFor="status"
          className="form-label"
        >
          Status
        </label>
        <select
          name="status"
          id="order-status"
          className="form-select"
          onChange={handleChange}
          value={values.status}
          defaultValue={''}
        >
          <option
            value=""
            disabled
          >
            {' '}
            -- select --
          </option>
          {statues.map((ev, index) => (
            <option
              value={ev}
              key={index}
              disabled={index < statusIndex}
            >
              {ev}
            </option>
          ))}
        </select>
        {errors?.status ? <p className="form-error">{errors?.status}</p> : null}
      </div>
      {/* <div className="form-group">
        <label
          htmlFor="item-id"
          className="form-label"
        >
          Track order id
        </label>
        <input
          type="text"
          name="itemId"
          id="item-id"
          className="form-input"
          placeholder="0000000000"
          onChange={handleChange}
          value={values.itemId}
        />
        {errors?.itemId ? <p className="form-error">{errors?.itemId}</p> : null}
      </div> */}
      {errors?.orderId ? <p className="form-error">{errors?.orderId}</p> : null}
      {errors?.merchant ? <p className="form-error">{errors?.merchant}</p> : null}

      <div>
        <div className="inline-flex gap-2 flex-wrap">
          <button
            className="btn-with-icon bg-primary"
            type="submit"
            disabled={disabled}
          >
            Save changes
          </button>
        </div>
      </div>
    </form>
  );
}
