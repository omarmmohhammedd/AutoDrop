import { Icon } from '@iconify/react';
import { useState } from 'react';
import Modal from './Modal';

interface IProps {
  Label: () => JSX.Element;
  Body: () => JSX.Element;
}

export default function Instructions({ Label, Body }: IProps) {
  const [visible, setVisible] = useState<boolean>(false);
  return (
    <>
      <div className="flex items-center gap-2">
        <button
          className="shrink-0 text-red-500 relative"
          type="button"
          onClick={() => setVisible(true)}
        >
          <span className="w-full h-full rounded-full absolute animate-ping opacity-50 bg-red-500 inset-0"></span>
          <Icon
            icon="ph:info-fill"
            width="18"
            height="18"
          />
        </button>
        {Label && (
          <div className="flex-1">
            <Label />
          </div>
        )}
      </div>
      <Modal
        visible={visible}
        title="Instructions"
        handleClose={() => setVisible(false)}
      >
        <Body />
      </Modal>
    </>
  );
}
