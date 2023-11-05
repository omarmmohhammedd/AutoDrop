import { Icon } from '@iconify/react';
import React, { FC } from 'react';
import { motion } from 'framer-motion';
import { MoveToBottom, MoveToTop } from '../../animations';
import { Link } from 'react-router-dom';

export interface ItemInterface {
  icon: string;
  color: string;
  title?: string;
  key?: string;
  value?: string | number;
  url?: string;
  type?: string | undefined;
}

export const MiniDashboardSingleCard: FC<{ item: ItemInterface }> = ({ item }): JSX.Element => {
  return (
    <Link
      to={item.url || '#'}
      className="bg-white  p-6 rounded-2xl inline-flex gap-4 items-center shadow-2xl shadow-neutral-600/5 border border-neutral-200"
    >
      <span className={['shrink-0 inline', item.color].join(' ')}>
        <Icon
          icon={item.icon}
          width={36}
        />
      </span>
      <div className="flex-1">
        <motion.p
          animate="visible"
          initial="hidden"
          variants={MoveToTop}
          className="text-lg font-bold text-neutral-800 tabular-nums"
        >
          {Number(item.value).toFixed(3)}
        </motion.p>
        <motion.p
          animate="visible"
          initial="hidden"
          variants={MoveToBottom}
          className="text-sm font-medium text-neutral-500"
        >
          {item.title}
        </motion.p>
      </div>
    </Link>
  );
};
