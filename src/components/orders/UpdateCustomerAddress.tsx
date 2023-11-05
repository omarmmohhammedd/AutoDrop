import { Icon } from '@iconify/react';
import { AxiosError } from 'axios';
import { pick } from 'lodash';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from 'src/helper/AxiosInstance';
import useForm from 'src/hooks/useForm';
import Modal from '../shared/Modal';
import { translateCity } from 'src/helper/City';

export default function UpdateCustomerAddress({ order, refetch,getProvince,citiesData }: {order: any; refetch: any,getProvince:any,citiesData:any }) {
  const [visible, setVisible] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>();
  const { id } = useParams();
  const [cityShip,setCityShip] = useState('')
  const [provinceShip,setProvinceShip] = useState('')
  const handelChangeInput = (e:any,handleChange:any)=>{
    const inputValue = e.target.value;
    const englishLettersRegex = /^[A-Za-z\s]+$/;
    if (e.target.value=='' || englishLettersRegex.test(inputValue))   {
      setErrors({})
      handleChange(e)
    }
    else  setErrors({[e?.target.name]:'Add Letters Only In English'})
    
  }
  useEffect(()=>{
    setCityShip(order?.shipping?.address?.city_en || translateCity(order?.shipping?.address?.city))

  },[order])
  useEffect(()=>{
    setProvinceShip( order?.shipping?.address?.province_en || getProvince(cityShip))
    console.log(cityShip)
  },[cityShip])
  const {
    formik: { handleSubmit, handleChange, values }
  } = useForm({
    initialValues: { id,city:cityShip,province:provinceShip,street:order?.shipping?.address?.street_en || '',district:order?.shipping?.address?.district_en || '',postal_code:order.shipping.address.postal_code},
    submitHandler: UpdateAddress
  });

  async function UpdateAddress(val: any, helpers: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      console.log(val)
      const { status } = await axiosInstance.post('orders/update-address', val);
      if(status === 200){
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
        title="Customer address"
      >
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <select  
                        className="form-input" 
                       defaultValue={cityShip} 
                       onChange={(e)=>handelChangeInput(e,handleChange)}
                       onBlur={(e)=>{
                        setCityShip(e.target.value)
                        setProvinceShip(getProvince(e.target.value))
                       }}
                       name='city'>
                      {citiesData.length && citiesData.map((e:any)=>{
                        return (
                          <option>{e}</option>
                        )
                      })}
            </select>
            {errors?.city ? (
              <p className="form-error text-center !block">{errors?.postal_code}</p>
            ) : null}
          </div>
          <div className="form-group">
            <input
              name="province"
              placeholder="Province"
              className="form-textarea form-outline"
              value={provinceShip}
              onChange={(e)=>handelChangeInput(e,handleChange)}
              required
              type="text"
            />
            {errors?.province ? (
              <p className="form-error text-center !block">{errors?.postal_code}</p>
            ) : null}
          </div>
          <div className="form-group">
            <input
              name="postal_code"
              placeholder="Place zip/Postal code"
              className="form-textarea form-outline"
              value={values?.postal_code}
              defaultValue={order.shipping.address.postal_code}
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
            />
            {errors?.postal_code ? (
              <p className="form-error text-center !block">{errors?.postal_code}</p>
            ) : null}
          </div>
          <div className="form-group">
            <input
              name="district"
              placeholder="District"
              className="form-textarea form-outline"
              value={values?.district}
              onChange={(e)=>handelChangeInput(e,handleChange)}
              defaultValue={order?.shipping?.address?.district_en}
              required
              type="text"
            />
            {errors?.district ? (
              <p className="form-error text-center !block">{errors?.district}</p>
            ) : null}
          </div>
          <div className="form-group">
            <input
              name="street"
              placeholder="Street"
              className="form-textarea form-outline"
              value={values?.street}
            onChange={(e)=>handelChangeInput(e,handleChange)}
              defaultValue={order.shipping.address.street}
              required
              type="text"
            />
            {errors?.street ? (
              <p className="form-error text-center !block">{errors?.street}</p>
            ) : null}
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
