import { Icon } from '@iconify/react';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from 'src/helper/AxiosInstance';

export default function SendOrder() {
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>();
  const { id } = useParams();

  async function SendOrder() {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('ae/orders/place-order', { id });

      console.log(data);
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
        onClick={SendOrder}
        disabled={disabled}
      >
        <Icon
          icon="solar:hand-money-outline"
          width="20"
        />
        <span>Send order</span>
      </button>
    </>
  );
}
