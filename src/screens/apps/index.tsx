import React from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { MoveToTop } from 'src/animations';

export default function index() {
  return (
    <div className="p-8 pt-2 space-y-4">
      <div>
        <div className="table-actions">
          <button className="btn-with-icon outline-btn !text-content !text-sm">
            <Icon
              icon="material-symbols:add-rounded"
              width={15}
              height={15}
            />
            <span>Add new app</span>
          </button>
        </div>
      </div>
      <ul className="grid grid-wrapper gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.li
            variants={MoveToTop}
            animate="visible"
            initial="hidden"
            key={i}
            className="rounded-2xl bg-white border border-ring-border shadow-2xl shadow-neutral-800/5 p-6"
          >
            <div className="inline-flex gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-title bg-ground">
                <Icon
                  icon="gg:extension-add"
                  width={35}
                  height={35}
                />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-lg font-bold text-title">App name</p>
                  <p className="text-xs text-content">App_slug</p>
                </div>
                <div>
                  <div className="inline-flex gap-2 flex-wrap">
                    <button className="btn-with-icon bg-primary">Update settings</button>
                    <button className="btn-with-icon outline-btn  text-red-500">
                      <Icon
                        icon="mdi:remove-network-outline"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
