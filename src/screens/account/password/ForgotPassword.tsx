import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Password from 'src/components/shared/Password';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';
import useForm from 'src/hooks/useForm';

interface FormValues {
  email: string | undefined;
}

export default function ForgotPassword() {
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>();
  const [initialValues, setInitialValues] = useState<FormValues>({
    email: undefined
  });
  const navigate = useNavigate();
  const alert = useAlert();

  async function HandleSubmit(values: any, helper: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('/auth/forgot-password', {
        ...values,
        redirect: window.location.origin + '/account/reset-password'
      });

      alert.show({
        text: data?.message,
        visible: true
      });
    } catch (error: AxiosError | any) {
      const err = error.response;
      if (error instanceof AxiosError) {
        setErrors(err.data.message);
      }
    } finally {
      setDisabled(false);
    }
  }

  const { formik } = useForm({ initialValues, submitHandler: HandleSubmit });

  return (
    <div className="w-full h-full flex flex-col items-stretch">
      <div className="w-full flex  flex-1 max-w-xl flex-col mx-auto">
        <form
          className="flex-1 flex items-center justify-center p-8"
          onSubmit={formik.handleSubmit}
        >
          <div className="space-y-4 w-full">
            <div className="form-group">
              <label
                htmlFor="email"
                className="form-label"
              >
                E-mail address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="form-input !p-4"
                placeholder="example@example.com"
                autoComplete="off"
                autoCorrect="false"
                autoFocus
                value={formik.values.email}
                onChange={formik.handleChange}
              />
              {errors?.email ? <span className="form-error">{errors?.email}</span> : null}
              {errors?.redirect ? <span className="form-error">{errors?.redirect}</span> : null}
            </div>

            <div className="space-y-2">
              <button
                className="btn-with-icon bg-primary w-full !p-4 !text-base"
                type="submit"
                disabled={disabled}
              >
                <span>Send OTP</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
