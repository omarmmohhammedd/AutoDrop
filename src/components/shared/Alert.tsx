import { Icon } from '@iconify/react';
import React from 'react';
import { motion } from 'framer-motion';
import { MoveToBottom, MoveToTop } from 'src/animations';

type Types = 'error' | 'info' | 'success' | 'default' | 'warn';

interface IProps {
  title?: string;
  content?: string;
  type?: Types;
}

const Alert: React.FC<IProps> = ({ content, title, type = 'info' }) => {
  const icons: Record<Types, string> = {
    error: 'akar-icons:chat-error',
    info: 'tabler:info-square-rounded',
    warn: 'tabler:info-square-rounded',
    success: 'mdi:bookmark-success-outline',
    default: 'tabler:info-square-rounded'
  };

  const classes: Record<Types, string> = {
    error: 'bg-red-100 ring-1 ring-red-200 text-red-600',
    info: 'bg-neutral-100 ring-1 ring-neutral-200 text-neutral-600',
    warn: 'bg-yellow-400 ring-1 ring-yellow-500 text-neutral-800',
    success: 'bg-teal-100 ring-1 ring-teal-200 text-teal-600',
    default: 'bg-white ring-1 ring-neutral-200 text-neutral-600'
  };

  return (
    <div>
      <div className={['w-full p-5 rounded-lg flex gap-4', classes[type]].join(' ')}>
        <Icon
          icon={icons[type]}
          width={24}
          className="shrink-0 mt-1"
        />
        <div className="shrink-0 flex-1 space-y-1">
          {title ? (
            <motion.p
              animate="visible"
              initial="hidden"
              variants={MoveToTop}
              className="text-base font-semibold"
            >
              {title}
            </motion.p>
          ) : null}
          {content ? (
            <motion.p
              animate="visible"
              initial="hidden"
              variants={MoveToBottom}
              className="text-sm"
            >
              {content}
            </motion.p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Alert;
