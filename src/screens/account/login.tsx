import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Password from 'src/components/shared/Password';
import axiosInstance from 'src/helper/AxiosInstance';
import useForm from 'src/hooks/useForm';
import { storeToken } from 'src/reducers/auth';

interface FormValues {
  email: string | undefined;
  password: string | undefined;
}

export default function login() {
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormValues | undefined>();
  const [initialValues, setInitialValues] = useState<FormValues>({
    email: undefined,
    password: undefined
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function HandleSubmit(values: any, helper: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('/auth/login', values);
      const { access_token } = data;
      localStorage.setItem('@token', access_token);
      dispatch(storeToken(access_token));
      return navigate('/', { replace: true });
      // window.location.reload();
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
    <div className="w-full h-full flex flex-col items-stretch bg-primary">
      {/* <div className="flex-1 bg-secondary"></div> */}
      <div className="w-full flex  flex-1 max-w-xl flex-col mx-auto">
        <form
          className="flex-1 flex items-center justify-center p-8"
          onSubmit={formik.handleSubmit}
        >
          <div className="space-y-4 w-full">
            <img
              src="/images/logos/1.png"
              alt="website logo"
              className="w-full max-w-[10rem] mx-auto block"
            />
            <div className="form-group">
              <label
                htmlFor="email"
                className="form-label !text-white"
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
            </div>
            <div className="form-group">
              <label
                htmlFor="email"
                className="form-label !text-white"
              >
                Password
              </label>
              <Password
                name="password"
                id="password"
                className="form-input !p-4"
                placeholder="••••••••"
                autoComplete="off"
                autoCorrect="false"
                autoFocus
                value={formik.values.password}
                onChange={formik.handleChange}
              />
              {errors?.password ? <span className="form-error">{errors?.password}</span> : null}
            </div>
            <div>
              <Link
                to="/account/forgot-password"
                className="text-secondary text-sm"
              >
                Forgot password?
              </Link>
            </div>
            <div className="space-y-4">
              <button
                className="btn-with-icon bg-secondary w-full !p-4 !text-base"
                type="submit"
                disabled={disabled}
              >
                <span>Sign</span>
              </button>
              <p className="text-center text-white/60 text-sm p-2">
                For new account, your should install our application in your store first.{' '}
                <a
                  href="https://apps.salla.sa/ar/app/1931877074"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary font-medium "
                >
                  Install now
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
