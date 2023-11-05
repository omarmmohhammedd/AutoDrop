import { Icon } from '@iconify/react';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from 'src/helper/AxiosInstance';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import useForm from 'src/hooks/useForm';
import Modal from '../shared/Modal';

export default function PlaceOrderForm({ order, amount }: { order: any; amount: number }) {
  const [visible, setVisible] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>();
  const { id } = useParams();

  const {
    formik: { handleSubmit, handleChange, values }
  } = useForm({ initialValues: { id, notes: undefined }, submitHandler: SendOrder });

  async function SendOrder(val: any, helpers: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('orders/pay-order', val);

      window.open(data.result?.url, 'new');
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
    <>
      <button
        className="btn-with-icon bg-primary w-full"
        type="button"
        onClick={() => {
          // if (!order?.products_shipping_services?.length)
          //   return generateAlert('Shipping services must includes order.', 'info');
          // if (!order?.customer_address?.address)
          //   return generateAlert('Customer address not included', 'info');
          setVisible(true);
        }}
      >
        <Icon
          icon="solar:hand-money-outline"
          width="20"
        />
        <span>Pay now</span>
      </button>

      <Modal
        visible={visible}
        handleClose={() => setVisible(false)}
        title="Pay order"
      >
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
              The request will be sent to the administration first so that the necessary procedures
              for that request are followed and the required is verified, then you will be notified
              of the new, you must pay the next amount{' '}
              <span className="font-bold text-teal-600">{CurrencyFormatter(amount || 0)}</span> and
              verify first that that amount is already available on the credit card
            </p>
            <div className="form-group !my-4">
              <textarea
                name="notes"
                placeholder="Place order notes here.."
                className="form-textarea form-outline"
                value={values?.notes}
                onChange={handleChange}
              ></textarea>
            </div>
            {errors ? <p className="form-error text-center !block">{errors}</p> : null}
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
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
