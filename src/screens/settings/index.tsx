import React, { useState } from 'react';
import Cleave from 'cleave.js/react';
import Card from 'src/components/shared/Card';
import 'cleave.js/dist/addons/cleave-phone.sa';
import Modal from 'src/components/shared/Modal';
import ChangePassword from 'src/components/account/ChangePassword';
import DeleteProfile from 'src/components/account/DeleteProfile';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import useForm from 'src/hooks/useForm';
import { AxiosError } from 'axios';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';

export default function index() {
  const [passVisible, setPassVisible] = useState<boolean>(false);
  const [deleteVisible, setDeleteVisible] = useState<boolean>(false);
  return (
    <div className="p-8 pt-2">
      <div className="flex items-start gap-4 flex-col-reverse lg:flex-row">
        <div className="w-full lg:max-w-sm space-y-4">
          <Card className="space-y-4">
            <div className="space-y-2">
              <p className="text-xl font-bold">Change password</p>
              <p className="text-sm text-gray-500">
                You can permanently delete or temporarily freeze your account.
              </p>
            </div>
            <button
              className="btn-with-icon !p-3 bg-primary/10 !text-primary w-full !text-sm"
              onClick={() => setPassVisible(true)}
            >
              Change password
            </button>
          </Card>
          <Card className="space-y-4">
            <div className="space-y-2">
              <p className="text-xl font-bold">Delete account</p>
              <p className="text-sm text-gray-500">
                You can permanently delete or temporarily freeze your account.
              </p>
            </div>
            <button
              className="btn-with-icon !p-3 bg-red-500/10 !text-red-500 w-full !text-sm"
              onClick={() => setDeleteVisible(true)}
            >
              Delete account
            </button>
          </Card>
        </div>
        <div className="space-y-4 w-full flex-1">
          <Card className="space-y-4">
            <p className="text-xl font-bold">Profile details</p>
            <UpdateProfile />
          </Card>
          <Card className="space-y-4">
            <div className="space-y-2">
              <p className="text-xl font-bold">Auto Drop</p>
              <p className="text-sm text-gray-500">
                AutoDrop is a website established in 2023 in order to facilitate and facilitate the
                e-commerce process for merchants, as it provides them with the service of automatic
                linking between their store and the famous sites and platforms that support
                dropshipping.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        visible={passVisible}
        handleClose={() => setPassVisible(false)}
        title="Change password"
      >
        <React.Fragment>
          <ChangePassword />
        </React.Fragment>
      </Modal>

      <Modal
        visible={deleteVisible}
        handleClose={() => setDeleteVisible(false)}
        title="Delete account"
      >
        <React.Fragment>
          <DeleteProfile />
        </React.Fragment>
      </Modal>
    </div>
  );
}

function UpdateProfile() {
  const alert = useAlert();
  const { user } = useSelector((state: RootState) => state.auth);
  const [initialValues, setInitialValues] = useState<any>(user);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>();

  async function UpdateProfileInfo() {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('auth/update-profile', values);
      alert.show({ text: data?.message, visible: true });
      // reload current window to get updated information
      window.location.reload();
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
    submitHandler: UpdateProfileInfo
  });
  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label className="form-label">Full name</label>
        <input
          type="text"
          placeholder="..."
          className="form-input"
          value={values.name}
          name="name"
          onChange={handleChange}
        />
        {errors?.name ? <span className="form-error">{errors?.name}</span> : null}
      </div>
      <div className="form-group">
        <label className="form-label">E-mail address</label>
        <input
          type="email"
          placeholder="example@example.com"
          className="form-input"
          value={values.email}
          name="email"
          onChange={handleChange}
        />
        {errors?.email ? <span className="form-error">{errors?.email}</span> : null}
      </div>
      <div className="form-group">
        <label className="form-label">Phone number</label>
        <Cleave
          options={{
            phone: true,
            phoneRegionCode: 'sa'
          }}
          placeholder="966"
          className="form-input"
          value={values.mobile}
          name="mobile"
          onChange={handleChange}
        />
        {errors?.mobile ? <span className="form-error">{errors?.mobile}</span> : null}
      </div>
      <div>
        <button
          className="btn-with-icon !p-3 bg-secondary !text-sm"
          type="submit"
          disabled={disabled}
        >
          Save changes
        </button>
      </div>
    </form>
  );
}
