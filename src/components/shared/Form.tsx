import React, { ReactNode } from 'react';
import { useFormik, FormikConfig, FormikValues, FormikHelpers, Formik } from 'formik';

interface FormProps {
  children: any;
  headerList?: ReactNode;
  SubmitButton?: ReactNode;
  headerTitle?: string;
  initialValues: FormikValues;
  formikSubmit: (
    values: FormikValues,
    formikHelpers: FormikHelpers<FormikValues>
  ) => void | Promise<any>;
}

const Form: React.FC<FormProps> = ({
  children,
  SubmitButton,
  headerList,
  headerTitle,
  initialValues,
  formikSubmit
}) => {
  const formikConfiguration: FormikConfig<FormikValues> = {
    initialValues,
    onSubmit: formikSubmit
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

  return (
    <div className="w-full max-w-screen-lg mx-auto shadow-2xl shadow-neutral-600/10 ring-1 ring-neutral-200 rounded-2xl bg-white">
      <header className="w-full border-b border-b-neutral-200 px-6 py-4 flex justify-between gap-4">
        <div className="flex-1 grid">
          <p className="text-lg font-semibold text-neutral-800">{headerTitle}</p>
        </div>
        {headerList}
      </header>
      <form
        className="w-full p-6 space-y-4"
        onSubmit={formik.handleSubmit}
      >
        {
          <>
            {React.Children.map(children, (child: JSX.Element) => {
              return React.cloneElement(child, {
                handleChange,
                formik
              });
            })}
          </>
        }
        <button
          className="btn-with-icon bg-primary"
          type="submit"
        >
          {SubmitButton}
        </button>
      </form>
    </div>
  );
};

export default Form;
