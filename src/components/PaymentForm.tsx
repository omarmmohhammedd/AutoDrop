import React, { FormEventHandler, useEffect, useState } from 'react';
import Cleave from 'cleave.js/react';
import useForm from 'src/hooks/useForm';
import axiosInstance from 'src/helper/AxiosInstance';
import { AxiosError } from 'axios';
import { useAlert } from 'src/hooks/alerts';
import Alert from './shared/Alert';

interface PaymentForm {
  holder: string | undefined;
  number: string | undefined;
  exp_month: string | undefined;
  exp_year: string | undefined;
  cvc: string | undefined;
}
let tap: any;
let card: any;

export default function PaymentForm() {
  const paymentValues = {
    holder: undefined,
    number: undefined,
    exp_month: undefined,
    exp_year: undefined,
    cvc: undefined
  } satisfies PaymentForm;
  const [errors, setErrors] = useState<any>();
  const [initialValues, setInitialValues] = useState<PaymentForm>(paymentValues);
  const [disabled, setDisabled] = useState<boolean>(false);
  const alert = useAlert();

  useEffect(() => {
    (async () => {
      try {
        const isExisted = document.querySelectorAll('script[data-type="payment-js"]');
        if (isExisted?.length) {
          DisplayTabElementWithOptions();
          return;
        }
        await Promise.all([
          CreateScript('https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.4/bluebird.min.js'),
          CreateScript('https://secure.gosell.io/js/sdk/tap.min.js')
        ]);

        DisplayTabElementWithOptions();
      } catch (error) {
        console.log('error while creating elements', error);
      }
    })();
  }, []);

  function CreateScript(src: string) {
    return new Promise((resolve) => {
      const body = document.querySelector('body');
      const script = document.createElement('script');
      script.src = src;
      // script.async = true;
      script.setAttribute('data-type', 'payment-js');

      body?.append(script);
      script.onload = () => {
        console.log('payment-js has been loaded!!');
        resolve(script);
      };
    });
  }

  function DisplayTabElementWithOptions() {
    tap = (window as any)?.Tapjsli('pk_test_w2eTXQi1n3qpAdWrsMLBD0VE');
    const elements = tap?.elements({});
    const style = {
      base: {
        color: '#535353',
        lineHeight: '18px',
        fontFamily: 'sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: 'rgba(0, 0, 0, 0.26)',
          fontSize: '15px'
        }
      },
      invalid: {
        color: 'red'
      }
    };
    // input labels/placeholders
    const labels = {
      cardNumber: 'Card Number',
      expirationDate: 'MM/YY',
      cvv: 'CVV',
      cardHolder: 'Card Holder Name'
    };
    //payment options
    const paymentOptions = {
      currencyCode: ['SAR'],
      labels: labels,
      TextDirection: 'ltr',
      paymentAllowed: ['VISA', 'MADA', 'MASTERCARD']
    };
    //create element, pass style and payment options
    card = elements.create('card', { style: style }, paymentOptions);
    //mount element
    card.mount('div[data-type="payment-form"]');

    console.log(card);

    card.addEventListener('change', function (event: any) {
      if (event.loaded) {
        console.log('UI loaded :' + event.loaded);
        console.log('current currency is :' + card.getCurrency());
      }
      if (event.error_interactive) {
        setDisabled(true);
        setErrors(event.error_interactive);
        return;
      }
      setDisabled(false);
      setErrors(undefined);
    });
  }

  async function CreateProduct(e: any) {
    try {
      e.preventDefault();
      setDisabled(true);
      setErrors(undefined);
      const result = await tap.createToken(card);
      if (result.error) {
        setErrors(result.error);
        return;
      }
      console.log(result);
      const { data } = await axiosInstance.post('v1/payments/add', { token: result.id, card: result.card });
      alert.show({
        text: data?.message,
        visible: true
      });
      card?.resetForm();
      window.location.reload();
    } catch (error: AxiosError | any) {
      const err = error.response;
      const _errors = err?.data?.message?.error?.fields;

      if (_errors) {
        setErrors(_errors);
      }
    } finally {
      setDisabled(false);
    }
  }

  // const {
  //   formik: { handleSubmit, handleChange, values, setFieldValue }
  // } = useForm({ initialValues, submitHandler: CreateProduct });

  return (
    <form
      className="space-y-4"
      onSubmit={CreateProduct}
    >
      {errors ? <Alert content={errors?.message} /> : null}

      <div data-type="payment-form"></div>
      {/* <div className="form-group">
        <label className="form-label">Holder name</label>
        <input
          type="text"
          autoComplete="off"
          className="form-input"
          placeholder="..."
          value={values?.holder}
          name="holder"
          onChange={handleChange}
        />
        {errors?.holder ? <span className="form-error">{errors?.holder}</span> : null}
      </div>
      <div className="form-group">
        <label className="form-label">Card number</label>
        <Cleave
          placeholder="xxxx xxxx xxxx xxxx"
          autoComplete="off"
          className="form-input"
          options={{ creditCard: true }}
          value={values?.number}
          name="number"
          onChange={handleChange}
        />
        {errors?.number ? <span className="form-error">{errors?.number}</span> : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Expiry month</label>
          <Cleave
            placeholder="MM"
            autoComplete="off"
            className="form-input"
            options={{ date: true, datePattern: ['m'] }}
            value={values?.exp_month}
            name="exp_month"
            onChange={handleChange}
          />
          {errors?.exp_month ? <span className="form-error">{errors?.exp_month}</span> : null}
        </div>
        <div className="form-group">
          <label className="form-label">Expiry year</label>
          <Cleave
            placeholder="YYYY"
            autoComplete="off"
            className="form-input"
            options={{ date: true, datePattern: ['Y'] }}
            value={values?.exp_year}
            name="exp_year"
            onChange={handleChange}
          />
          {errors?.exp_year ? <span className="form-error">{errors?.exp_year}</span> : null}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Security code</label>
        <input
          type="number"
          autoComplete="off"
          className="form-input"
          placeholder="123"
          value={values?.cvc}
          name="cvc"
          onChange={handleChange}
        />
        {errors?.cvc ? <span className="form-error">{errors?.cvc}</span> : null}
      </div>*/}
      <div>
        <div className="inline-flex gap-3 flex-wrap">
          <button
            className="btn-with-icon bg-secondary !text-sm"
            type="submit"
            disabled={disabled}
          >
            <span>Save card</span>
          </button>
        </div>
      </div>
    </form>
  );
}
