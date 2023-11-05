import React, { useState } from 'react';
import { useAlert } from 'src/hooks/alerts';
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.sa';
import useForm from 'src/hooks/useForm';
import axiosInstance from 'src/helper/AxiosInstance';
import { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

interface FormInterface {}

export default function Contact() {
  const globalValues = {} satisfies FormInterface;
  const [errors, setErrors] = useState<any>();
  const [initialValues, setInitialValues] = useState<FormInterface>(globalValues);
  const [disabled, setDisabled] = useState<boolean>(false);
  const { token } = useSelector((state: RootState) => state.auth);
  const alert = useAlert();

  async function SendMessage(values: any, helpers: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('contact', {
        ...values,
        mobile: values?.mobile?.replace(/\s/gi, '')
      });
      alert.show({
        text: data?.message,
        visible: true
      });
      helpers.resetForm();
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
  } = useForm({ initialValues, submitHandler: SendMessage });

  return (
    <div className={['p-8 space-y-8', token ? 'pt-2' : ''].join(' ')}>
      <form
        className="space-y-4 max-w-screen-sm mx-auto"
        onSubmit={handleSubmit}
      >
        <p className="text-4xl text-title font-bold">Contact us</p>

        <div className="space-y-3">
          <label className="form-label">Full name</label>
          <input
            type="text"
            name="name"
            id="name"
            className="form-input form-outline"
            placeholder="Full Name"
            value={values.name}
            onChange={handleChange}
          />
          {errors?.name ? <span className="form-error">{errors?.name}</span> : null}
        </div>
        <div className="space-y-3">
          <label className="form-label">Email address</label>
          <input
            type="email"
            name="email"
            id="email"
            className="form-input form-outline"
            placeholder="example@mail.com"
            value={values.email}
            onChange={handleChange}
          />
          {errors?.email ? <span className="form-error">{errors?.email}</span> : null}
        </div>
        <div className="form-group">
          <label className="form-label">Phone number</label>
          <Cleave
            placeholder="966 523 4567"
            className="form-input form-outline"
            options={{
              phone: true,
              phoneRegionCode: 'sa'
            }}
            name="mobile"
            value={values.mobile}
            onChange={handleChange}
          />
          {errors?.mobile ? <span className="form-error">{errors?.mobile}</span> : null}
        </div>
        <div className="space-y-3">
          <label className="form-label">Message</label>
          <textarea
            name="message"
            id="message"
            className="form-textarea form-outline"
            placeholder="Your message..."
            value={values.message}
            onChange={handleChange}
          />
          {errors?.message ? <span className="form-error">{errors?.message}</span> : null}
        </div>
        <div>
          <button
            className="btn-with-icon bg-secondary !text-sm"
            type="submit"
          >
            Send message
          </button>
        </div>
      </form>
    </div>
  );
}
