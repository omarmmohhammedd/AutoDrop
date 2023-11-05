import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { MoveToTop } from 'src/animations';
import Table from 'src/components/shared/tables';
import { Link } from 'react-router-dom';
import CurrencyFormatter from 'src/helper/CurrencyFormatter';
import SharedTime from 'src/components/shared/SharedTime';
import Image from 'src/components/shared/Image';
import { ConfirmAlert, useAlert } from 'src/hooks/alerts';
import { AxiosError } from 'axios';
import axiosInstance from 'src/helper/AxiosInstance';
import useUsersHooks from 'src/hooks/users';
import Modal from 'src/components/shared/Modal';
import Password from 'src/components/shared/Password';
import Cleave from 'cleave.js/react';
import 'cleave.js/dist/addons/cleave-phone.sa';
import Alert from 'src/components/shared/Alert';
import useForm from 'src/hooks/useForm';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

export default function index() {
  let rerender: boolean = true;
  const [visible, setVisible] = useState<boolean>(false);
  const { pagination, isLoading, users, GetUsers } = useUsersHooks();
  const alert = useAlert();
  const { user } = useSelector((state: RootState) => state.auth);

  async function DeleteItem(id: string) {
    try {
      const { data } = await axiosInstance.post('auth/users/delete', { id });
      alert.show({
        text: data?.message,
        visible: true
      });

      if (id === user?.id) {
        localStorage.removeItem('@token');
        window.location.reload();
      }
      await GetUsers();
    } catch (error: AxiosError | any) {
      const err = error.response?.data;
      if (err) {
        const _serviceError = err?.message?.error?.message;
        alert.show({
          text: _serviceError || err?.message,
          visible: true
        });
      }
    }
  }

  const MEMO_TABLE = useMemo(() => {
    return (
      <Table
        RenderHead={() => {
          return (
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>E-mail address</th>
              <th>Mobile</th>
              <th>Type</th>
              <th>Added date</th>
              {/* <th>Actions</th> */}
            </tr>
          );
        }}
        RenderBody={() => {
          return (
            <>
              {users.map((item: any, i: number) => {
                return (
                  <DisplayTableItem
                    item={item}
                    DeleteItem={DeleteItem}
                  />
                );
              })}
            </>
          );
        }}
        title={'Users table'}
        isEmpty={!users?.length}
        pagination={pagination}
        searchProps={{
          defaultValue: pagination.search_key,
          onKeyDown: ({ key, target }: any) => {
            if (key === 'Enter') {
              GetUsers({
                search_key: target.value
              });
            }
          }
        }}
        onNextClick={() => pagination.page + 1}
        onPreviousClick={() => pagination.page - 1}
        loading={isLoading}
      />
    );
  }, [pagination, isLoading, users]);

  return (
    <div className="p-8 pt-2 space-y-4">
      <div>
        <div className="table-actions">
          <button
            className="btn-with-icon outline-btn !text-content !text-sm"
            onClick={() => setVisible(true)}
          >
            <Icon
              icon="material-symbols:add-rounded"
              width={15}
              height={15}
            />
            <span>New user</span>
          </button>
        </div>
      </div>
      {MEMO_TABLE}
      <Modal
        visible={visible}
        handleClose={() => setVisible(false)}
        title="Add new user"
      >
        <Fragment>
          <AddNewUser
            handleClose={setVisible}
            reFetching={GetUsers}
          />
        </Fragment>
      </Modal>
    </div>
  );
}

function DisplayTableItem({ item, DeleteItem }: any) {
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

  return (
    <tr>
      <td>
        <div>
          <Image
            src={item?.avatar}
            className="w-12 h-12 rounded-lg object-cover border border-ring-border shrink-0"
          />
        </div>
      </td>
      <td>{item.name || 'N/A'}</td>
      <td>{item.email || 'N/A'}</td>
      <td>{item.mobile || 'N/A'}</td>
      <td>{item.userType || 'N/A'}</td>

      <td>
        <SharedTime date={item.createdAt} />
      </td>
      {/* <td>
        {item.userType === 'admin' && (
          <div className="inline-flex gap-2">
            <button className="btn-with-icon outline-btn text-content w-fit">
              <Icon
                icon="ri:eye-line"
                width={15}
                height={15}
              />
            </button>
            <button className="btn-with-icon outline-btn">
              <span>Update</span>
            </button>
            <button
              className="btn-with-icon bg-red-500"
              onClick={() => setDeleteConfirm(true)}
            >
              <span>Delete</span>
            </button>
          </div>
        )}
      </td> */}
      <ConfirmAlert
        visible={deleteConfirm}
        requestClose={() => setDeleteConfirm(false)}
        handleConfirm={async function () {
          await DeleteItem(item.id);
          setDeleteConfirm(false);
        }}
      />
    </tr>
  );
}

interface NewUserForm {
  name: string | undefined;
  mobile: string | undefined;
  email: string | undefined;
  userType: string | undefined;
  password: string | undefined;
}

function AddNewUser({ handleClose, reFetching }: any) {
  const globalValues = {
    name: undefined,
    mobile: undefined,
    email: undefined,
    userType: 'admin',
    password: undefined
  } satisfies NewUserForm;
  const [errors, setErrors] = useState<any>();
  const [initialValues, setInitialValues] = useState<NewUserForm>(globalValues);
  const [disabled, setDisabled] = useState<boolean>(false);
  const alert = useAlert();

  async function AddUserHandler(values: any) {
    try {
      setDisabled(true);
      setErrors(undefined);
      const { data } = await axiosInstance.post('auth/users/add', {
        ...values,
        mobile: values?.mobile?.replace(/\s/gi, '')
      });
      alert.show({
        text: data?.message,
        visible: true
      });
      await reFetching();
      handleClose(false);
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
  } = useForm({ initialValues, submitHandler: AddUserHandler });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <Alert
        content="Hello, you can only add users to manage the application and not merchants who are reviewed only for you to know the subscribers."
        type="info"
      />
      <div className="form-group">
        <label className="form-label">Full name</label>
        <input
          type="text"
          placeholder="..."
          className="form-input"
          name="name"
          value={values.name}
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
          name="email"
          value={values.email}
          onChange={handleChange}
        />
        {errors?.email ? <span className="form-error">{errors?.email}</span> : null}
      </div>
      <div className="form-group">
        <label className="form-label">Phone number</label>
        <Cleave
          placeholder="966 523 4567 form-outline"
          className="form-input"
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
      <div className="form-group">
        <label className="form-label">Password</label>
        <Password
          placeholder="..."
          className="form-input"
          name="password"
          value={values.password}
          onChange={handleChange}
        />
        {errors?.password ? <span className="form-error">{errors?.password}</span> : null}
      </div>
      <div>
        <button
          className="btn-with-icon bg-secondary !text-sm"
          type="submit"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
