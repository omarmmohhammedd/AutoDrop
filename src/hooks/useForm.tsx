import React from 'react';
import { FormikConfig, FormikHelpers, FormikValues, useFormik } from 'formik';

interface IProps {
  initialValues: FormikValues;
  submitHandler: FormikConfig<FormikValues>['onSubmit'];
}

export default function useForm<T>({ initialValues, submitHandler }: IProps) {
  const formikConfiguration: FormikConfig<typeof initialValues> = {
    initialValues,
    enableReinitialize: true,
    onSubmit: submitHandler
  };

  const formik = useFormik(formikConfiguration);

  const handleChange = React.useCallback(
    function (
      name: string,
      { target }: { target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement }
    ) {
      formik.setFieldValue(name, target.value);
    },
    [formik]
  );

  return { formik, handleChange };
}
