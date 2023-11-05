import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';
import useForm from 'src/hooks/useForm';
import { RootState } from 'src/store';
import Password from '../shared/Password';

interface PasswordInterface {
  'new-password': string | undefined;
  'confirmation-password': string | undefined;
}

export default function ChangePassword() {
  const alert = useAlert();
  const [initialValues, setInitialValues] = useState<PasswordInterface>({
    'new-password': undefined,
    'confirmation-password': undefined
  });
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>();
  const { user } = useSelector((state: RootState) => state.auth);

  async function ChangePasswordHandler() {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('auth/change-password', {
        ...values,
        email: user?.email
      });
      alert.show({ text: data?.message, visible: true });
      localStorage.removeItem('@token');
      window.location.reload();
    } catch (error: AxiosError | any) {
      const err = error.response;
      if (error instanceof AxiosError) {
        setErrors(err.data.message);
      }
    } finally {
      setDisabled(false);
    }
  }

  const {
    formik: { values, handleChange, handleSubmit }
  } = useForm({
    initialValues,
    submitHandler: ChangePasswordHandler
  });
  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label className="form-label">New password</label>
        <Password
          className="form-input"
          placeholder="••••••••"
          name="new-password"
          value={values['new-password']}
          onChange={handleChange}
        />
        {errors?.['new-password'] ? (
          <span className="form-error">{errors?.['new-password']}</span>
        ) : null}
      </div>
      <div className="form-group">
        <label className="form-label">Confirmation password</label>
        <Password
          className="form-input"
          placeholder="••••••••"
          name="confirmation-password"
          value={values['confirmation-password']}
          onChange={handleChange}
        />
        {errors?.['confirmation-password'] ? (
          <span className="form-error">{errors?.['confirmation-password']}</span>
        ) : null}
      </div>
      <div>
        <button
          className="btn-with-icon !p-3 bg-secondary !text-sm"
          type="submit"
          disabled={disabled}
        >
          Save changes
        </button>
      </div>
    </form>
  );
}
