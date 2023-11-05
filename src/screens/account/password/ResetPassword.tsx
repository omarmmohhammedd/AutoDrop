import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingComponent from 'src/components/shared/LoadingComponent';
import Password from 'src/components/shared/Password';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';
import useForm from 'src/hooks/useForm';
import { RootState } from 'src/store';

interface PasswordInterface {
  'new-password': string | undefined;
  'confirmation-password': string | undefined;
}

export default function ChangePassword() {
  let rerender: boolean = true;
  const alert = useAlert();
  const [initialValues, setInitialValues] = useState<PasswordInterface>({
    'new-password': undefined,
    'confirmation-password': undefined
  });
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<any>();
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!rerender) return;
    VerifyOTP();
    rerender = false;
  }, []);

  async function VerifyOTP() {
    try {
      setIsLoading(true);
      const otp = new URLSearchParams(search).get('otp');

      if (!otp) return navigate('/account/forgot-password', { replace: true });

      const { data } = await axiosInstance.get('auth/verify', { params: { otp } });
      alert.show({
        text: data.message,
        visible: true
      });
      setEmail(data?.result?.email);
    } catch (error: AxiosError | any) {
      const err = error?.response?.data;
      navigate('/account/forgot-password', { replace: true });

      if (err) {
        alert.show({
          text: err?.message,
          visible: true
        });
        return;
      }
      alert.show({
        text: 'There is something went wrong while verifying OTP',
        visible: true
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function ChangePasswordHandler() {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('auth/change-password', {
        ...values,
        email
      });
      alert.show({ text: data?.message, visible: true });
      localStorage.removeItem('@token');
      navigate('/account/login', { replace: true });
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

  if (isLoading) return <LoadingComponent />;

  return (
    <div className="w-full h-full flex flex-col items-stretch">
      <div className="w-full flex  flex-1 max-w-xl flex-col mx-auto">
        <form
          className="flex-1 flex items-center justify-center p-8"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4 w-full">
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
                className="btn-with-icon bg-primary w-full !p-4 !text-base"
                type="submit"
                disabled={disabled}
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
