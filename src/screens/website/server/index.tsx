import { AxiosError } from 'axios';
import React, { useState, useEffect } from 'react';
import { redirect } from 'react-router-dom';
import Card from 'src/components/shared/Card';
import LoadingComponent from 'src/components/shared/LoadingComponent';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';
import useForm from 'src/hooks/useForm';

function useHooks() {
  let render: boolean = true;
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!render) return;
    GetItems();
    render = false;
  }, []);

  async function GetItems() {
    try {
      const { data } = await axiosInstance.get('settings/keys');
      setSettings(data.settings);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return { GetItems, isLoading, settings };
}

export default function index() {
  const { isLoading, settings, GetItems } = useHooks();
  const [errors, setErrors] = useState<any>();
  const [initialValues, setInitialValues] = useState<any>();
  const [disabled, setDisabled] = useState<boolean>(false);
  const alert = useAlert();
  const  uriToken = async()=>{
    await axiosInstance.get('/settings/token').then((res)=>{
      console.log(res.data.url)
      const newTab = window.open(res.data.url, '_blank');
      newTab?.focus();
      GetItems();
      // window.loca
    })
  }
  // console.log(initialValues, settings);
  useEffect(() => {
    setInitialValues({ settings });
    console.log(settings)
  }, [settings]);

  async function CreatePlan(values: any, helpers: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      //console.table(values);
      const { data } = await axiosInstance.post('settings/keys/update', values);
      alert.show({
        text: data?.message,
        visible: true
      });
      GetItems();
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
  } = useForm({ initialValues, submitHandler: CreatePlan });

  if (isLoading) return <LoadingComponent />;

  return (
    <form
      className="p-8 pt-2 space-y-4"
      onSubmit={handleSubmit}
    >
      <Card>
        <header className="space-y-1 border-b border-b-gray-100 pb-4 mb-4">
          <p className="text-lg font-semibold">Keys</p>
          <p className="text-sm text-gray-600">
            You can update server settings such as used endpoints, access tokens and others <br />
          </p>
        </header>
        <ul className="space-y-3">
          {values.settings.map((item: any, index: number) => (
            
            <li key={index}>
              <div className="form-group">
                <label className="form-label">{item.label || item.key}</label>
                {item.key === "ALI_REFRESH_TOKEN" || item.key === "ALI_TOKEN" ? <input
                  type="text"
                  placeholder="Type text here.."
                  className="form-input"
                  name={'settings[' + index + '][value]'}
                  value={item.value}
                  onChange={handleChange}
                  disabled={true}
                /> : <input
                type="text"
                placeholder="Type text here.."
                className="form-input"
                name={'settings[' + index + '][value]'}
                value={item.value}
                onChange={handleChange}
              />}
                
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <button
        className="btn-with-icon bg-secondary !text-sm"
        type="submit"
      >
        Save changes
      </button>
    </form>
  );
}
