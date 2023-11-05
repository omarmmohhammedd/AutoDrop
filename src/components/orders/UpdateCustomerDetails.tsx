import { Icon } from '@iconify/react';
import { AxiosError } from 'axios';
import { pick } from 'lodash';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from 'src/helper/AxiosInstance';
import useForm from 'src/hooks/useForm';
import Modal from '../shared/Modal';

export default function UpdateCustomerDetails({ order, refetch }: { order: any; refetch: any }) {
  const [visible, setVisible] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>();
  const { id } = useParams();

  const customer = pick(order.customer, ['last_name', 'first_name','middle_name', 'mobile_code', 'mobile']);
  const {
    formik: { handleSubmit, handleChange, values }
  } = useForm({
    initialValues: { id, ...customer },
    submitHandler: UpdateDetails
  });

  async function UpdateDetails(val: any, helpers: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { status } = await axiosInstance.post('orders/update-customer-details', val);
      if(status ===200){
        setVisible(false)
        refetch()
      }
      refetch();
    } catch (error: AxiosError | any) {
      const err = error.response;
      if (error instanceof AxiosError) {
        setErrors(err.data.message);
      }
    } finally {
      setDisabled(false);
    }
  }
  const handelChangeInput = (e:any,handleChange:any)=>{
    const inputValue = e.target.value;
    const englishLettersRegex = /^[A-Za-z\s]+$/;
    if (e.target.value=='' || englishLettersRegex.test(inputValue))   {
      setErrors({})
      handleChange(e)
    }
    else  setErrors({[e?.target.name]:'Add Letters Only In English'})
    
  }

  return (
    <>
      {['in_transit', 'created'].includes(order.status) ? (
        <button
          type="button"
          className="btn-with-icon !text-blue-600 shrink-0 !rounded-full !p-0 !text-xs"
          onClick={() => setVisible(true)}
        >
          <Icon
            icon="material-symbols:edit-location-alt-outline-rounded"
            width="16"
          />
          <span>Update</span>
        </button>
      ) : null}

      <Modal
        visible={visible}
        handleClose={() => setVisible(false)}
        title="Cusomter Details"
      >
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <p className="form-label">First name</p>

              <input
                name="first_name"
                placeholder="First name"
                className="form-input form-outline"
                value={values?.first_name}
                onChange={(e)=>handelChangeInput(e,handleChange)}
                required
                type="text"
              />
              {errors?.first_name ? (
                <p className="form-error text-center !block">{errors?.first_name}</p>
              ) : null}
            </div>
            <div className="form-group">
              <p className="form-label">Middle name</p>

              <input
                name="middle_name"
                placeholder="Middle name"
                className="form-input form-outline"
                value={values?.middle_name}
                onChange={(e)=>handelChangeInput(e,handleChange)}
                required
                type="text"
              />
              {errors?.middle_name ? (
                
                <p className="form-error text-center  !block">{errors?.middle_name}</p>
              ) : null}
            </div>
            <div className="form-group">
              <p className="form-label">Last name</p>

              <input
                name="last_name"
                placeholder="Last name"
                className="form-input form-outline"
                value={values?.last_name}
                onChange={(e)=>handelChangeInput(e,handleChange)}
                required
                type="text"
              />
              {errors?.last_name ? (
                <p className="form-error text-center !block">{errors?.last_name}</p>
              ) : null}
            </div>
            <div className="form-group ">
              <p className="form-label">Mobile</p>
              <div className="flex items-center">
                <p
                  className="form-outline py-3 px-1 text-sm  !rounded-e-none"
                >{values?.mobile_code}</p>
                <input
                  name="mobile"
                  placeholder="5xxxxxxxx"
                  className="form-textarea form-outline"
                  defaultValue={values?.mobile}
                  onChange={(e)=>{
                    const englishNumbersRegex = /^[0-9]+$/;
                    if(englishNumbersRegex.test(e.target.value)  || e.target.value == ''){
                      setErrors({})
                      handleChange(e)
                    }
                    else  setErrors({[e?.target.name]:'Add Numbers Only '})
                  }}
                  required
                  type="text"
                  maxLength={9}
                  minLength={9}
                />
              </div>
              {errors?.mobile_code ? (
                <p className="form-error text-center !block">{errors?.mobile_code}</p>
              ) : null}
              {errors?.mobile ? (
                <p className="form-error text-center !block">{errors?.mobile}</p>
              ) : null}
            </div>
          </div>

          <div>
            <div className="flex gap-2 flex-wrap">
              <button
                className="btn-with-icon !text-sm !bg-secondary flex-[fit-content]"
                type="submit"
                disabled={disabled}
              >
                Submit
              </button>
              <button
                className="btn-with-icon !text-sm outline-btn flex-[fit-content]"
                type="button"
                disabled={disabled}
                onClick={() => setVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
