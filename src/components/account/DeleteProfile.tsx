import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';
import { RootState } from 'src/store';

export default function DeleteProfile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>();
  const alert = useAlert();

  async function DeleteAccountHandler() {
    try {
      setDisabled(true);
      const { data } = await axiosInstance.post('auth/delete', { id: user?.id });
      localStorage.removeItem('@token');
      alert.show({
        text: data.message,
        visible: true
      });
      window.location.reload();
    } catch (error: AxiosError | any) {
      const err = error.response;
      if (error instanceof AxiosError) {
        alert.show({
          text: JSON.stringify(err.data.message),
          visible: true
        });
      }
    } finally {
      setDisabled(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-500">
        If you want to deactivate your account, all activities that were created through the
        platform, including products, requests, and financial transactions, will be deleted.
      </p>
      <div className="mt-4">
        <button
          className="btn-with-icon !p-3 bg-red-500 !text-sm"
          onClick={DeleteAccountHandler}
          disabled={disabled}
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
