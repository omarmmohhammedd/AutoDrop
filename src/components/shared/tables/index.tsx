import { Icon } from '@iconify/react';
import React, { AllHTMLAttributes, FunctionComponent, ReactNode } from 'react';

interface TableInterface {
  loading?: boolean;
  isEmpty?: boolean;
  pagination?: any;
  onNextClick?: AllHTMLAttributes<HTMLButtonElement>['onClick'];
  onPreviousClick?: AllHTMLAttributes<HTMLButtonElement>['onClick'];
  searchProps?: AllHTMLAttributes<HTMLInputElement>;
  RenderBody: FunctionComponent;
  RenderHead: FunctionComponent;
  title?: string;
}

function Table({
  loading,
  pagination,
  searchProps,
  onNextClick,
  onPreviousClick,
  RenderBody,
  RenderHead,
  isEmpty,
  title
}: TableInterface) {
  return (
    <div className="relative rounded-lg  bg-white ring-1 ring-neutral-200 shadow-2xl shadow-neutral-600/5">
      <div className="p-4 flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-3 shrink-0 flex-auto">
          {loading ? (
            <Icon
              icon="svg-spinners:3-dots-fade"
              width={18}
            />
          ) : null}
          <p className="text-lg font-semibold text-neutral-500 shrink-0">{title}</p>
        </div>
        <div className="w-full sm:w-auto bg-neutral-50 inline-flex items-center p-3 rounded-lg h-11 border border-neutral-200">
          <span className="shrink-0 inline text-neutral-500">
            <Icon
              icon="ri:search-line"
              width={20}
            />
          </span>
          <input
            type="text"
            className="form-input !bg-transparent text-sm border-none py-0"
            placeholder="What are you looking for?"
            autoComplete="off"
            {...searchProps}
          />
        </div>
      </div>
      <div className="grid">
        <div className="overflow-x-auto">
          <table className="border-collapse w-full text-sm whitespace-nowrap border-t border-t-neutral-200">
            <thead className="bg-neutral-100">
              <RenderHead />
            </thead>
            <tbody>
              <RenderBody />

              {isEmpty ? (
                <tr className="border-b border-b-neutral-200 ">
                  <td
                    colSpan={100}
                    className="p-4 text-neutral-600 text-start"
                  >
                    <p className="text-neutral-500 flex-1 shrink-0 text-sm text-center">
                      There are no data to display
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      {pagination ? (
        <div className="p-4 flex items-center gap-4 flex-wrap">
          <p className="text-neutral-500 flex-1 shrink-0 text-sm">
            Showing {pagination?.current_page || 0} to {pagination?.totalPages || 0} of{' '}
            {pagination?.total || 0} results
          </p>
          <div className="inline-flex flex-wrap gap-2">
            <button
              className="btn-with-icon outline-btn shrink-0"
              disabled={pagination?.current_page === 1}
              onClick={onPreviousClick}
            >
              <span>Previous</span>
            </button>

            <button
              className="btn-with-icon outline-btn shrink-0"
              disabled={pagination?.current_page === pagination?.totalPages}
              onClick={onNextClick}
            >
              <span>Next</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Table;
