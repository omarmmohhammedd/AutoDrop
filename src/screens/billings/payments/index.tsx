import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import PaymentForm from 'src/components/PaymentForm';
import Card from 'src/components/shared/Card';
import Modal from 'src/components/shared/Modal';
import axiosInstance from 'src/helper/AxiosInstance';
import { useAlert } from 'src/hooks/alerts';
import { RootState } from 'src/store';

export default function index() {
  const [visible, setVisible] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Fragment>
      <div className="p-8 pt-2 space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-1 flex-1">
              <p className="text-2xl font-bold text-title">Credit cards</p>
              <p className="text-sm font-medium text-content">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quasi, inventore.
              </p>
            </div>
            <button
              className="btn-with-icon outline-btn"
              onClick={() => setVisible(true)}
            >
              Add new card
            </button>
          </div>
          <ul className="space-y-2">
            <li>
              <Card>
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-base font-bold text-title">41 ******** 21</p>
                      <p className="text-sm font-medium text-content">2023/22</p>
                    </div>
                    <button className="btn-with-icon !text-blue-500 !p-0">Select as default</button>
                  </div>
                  <button className="btn-with-icon bg-red-500">Delete</button>
                </div>
              </Card>
            </li>
          </ul>
          {!user?.pt_customer_id ? <EnableFeatureComponent /> : null}
        </Card>
      </div>
      <Modal
        visible={visible}
        title="Add new card"
        handleClose={() => setVisible(false)}
      >
        <Fragment>
          <PaymentForm />
        </Fragment>
      </Modal>
    </Fragment>
  );
}

function EnableFeatureComponent() {
  const [disabled, setDisabled] = useState<boolean>(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const alert = useAlert();

  async function EnableFeature() {
    try {
      setDisabled(true);
      const { data } = await axiosInstance.post('v1/payments/enable', { id: user?.id });
      alert.show({ text: data.message, visible: true });
      window.location.reload();
    } catch (error) {
      console.log(error);
    } finally {
      setDisabled(false);
    }
  }

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 bg-slate-800/5 backdrop-blur-sm !m-0 gap-4">
      <p className="text-sm text-center text-slate-800 font-medium italic">
        The payment feature is not activated, click on the following button to be able to add your
        credit card data and make one of them default to help you pay automatically without having
        to enter the data again
      </p>
      <button
        className="btn-with-icon bg-blue-500"
        disabled={disabled}
        onClick={EnableFeature}
      >
        Enable feature
      </button>
    </div>
  );
}
