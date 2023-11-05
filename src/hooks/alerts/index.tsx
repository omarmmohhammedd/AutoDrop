import { Icon } from '@iconify/react';
import React, { useState, createContext, useContext, Fragment, useCallback, memo } from 'react';
import { MoveToTop } from 'src/animations';
import { motion } from 'framer-motion';
import { Transition } from '@headlessui/react';
import Modal from 'src/components/shared/Modal';

type Types = 'confirm' | 'alert';

interface StateInterface {
  text: string;
  show: (obj: Omit<StateInterface, 'show'>) => any;
  visible: boolean;
  type?: Types;
}

interface InitialValuesInterface extends Omit<StateInterface, 'show'> {}

const AlertContext = createContext<StateInterface>({
  text: '',
  show: (obj: InitialValuesInterface): void => {},
  visible: false,
  type: 'alert'
});

const useAlert = () => useContext(AlertContext);

function AlertProvider({ children }: { children: React.ReactNode }) {
  const [initialValues, setInitialValues] = useState<InitialValuesInterface>({
    text: '',
    type: 'alert',
    visible: false
  });

  const show = useCallback(
    ({ type = 'alert', ...obj }: InitialValuesInterface): void => {
      setInitialValues((values) => ({
        ...values,
        ...obj,
        type
      }));
    },
    [initialValues]
  );

  return (
    <AlertContext.Provider value={{ ...initialValues, show }}>
      {initialValues.visible && (
        <>
          {initialValues.type === 'alert' ? (
            <Alert
              title={initialValues.text}
              handleClose={() =>
                setInitialValues((ev) => ({
                  ...ev,
                  visible: false
                }))
              }
            />
          ) : (
            <ConfirmAlert
              visible={initialValues.visible}
              requestClose={function (): void {
                show({
                  ...initialValues,
                  visible: false
                });
              }}
              handleConfirm={function (): void {
                show({
                  ...initialValues,
                  visible: true
                });
              }}
            />
          )}
        </>
      )}
      {children}
    </AlertContext.Provider>
  );
}

function Alert({
  title,
  handleClose
}: {
  title: string | undefined;
  handleClose: (value: boolean) => void;
}) {
  return (
    <div className="fixed w-full h-screen p-6 pointer-events-none z-[999999] left-0 bottom-0 flex items-end justify-center">
      <motion.div
        animate="visible"
        initial="hidden"
        variants={MoveToTop}
        className="bg-neutral-800 py-3 px-4 rounded-xl pointer-events-auto mx-auto w-auto"
      >
        <div className="inline-flex gap-3 items-center">
          <p className="text-white text-sm flex-1">{title}</p>
          <button
            className="btn-with-icon !text-white !bg-transparent hover:!bg-neutral-900 shrink-0 !p-2"
            onClick={() => handleClose(false)}
          >
            <Icon
              icon="ic:baseline-close"
              width={15}
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const ConfirmAlert = memo(
  ({
    visible,
    requestClose,
    handleConfirm
  }: {
    visible: boolean;
    requestClose: () => void;
    handleConfirm: () => void;
  }) => {
    return (
      <Modal
        visible={visible}
        handleClose={requestClose}
        title="Are you sure?"
      >
        <Fragment>
          <div className="space-y-2">
            {/* <p className="text-lg font-semibold text-neutral-800"></p> */}
            <p className="text-base text-neutral-500">
              If you really want to complete this procedure, everything related to it will be
              deleted and canceled, so make sure that you want to continue or not.
            </p>
            <div className="!mt-4">
              <div className="inline-flex gap-2 flex-wrap">
                <button
                  className="btn-with-icon !bg-red-500"
                  onClick={handleConfirm}
                  type="button"
                >
                  Confirm
                </button>
                <button
                  className="btn-with-icon outline-btn"
                  type="button"
                  onClick={requestClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Fragment>
      </Modal>
    );
  }
);

export { AlertProvider, useAlert, ConfirmAlert };
