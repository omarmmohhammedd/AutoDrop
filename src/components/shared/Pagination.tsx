import { AllHTMLAttributes } from 'react';

interface IProps {
  pagination: any;
  onPreviousClick: AllHTMLAttributes<HTMLButtonElement>['onClick'];
  onNextClick: AllHTMLAttributes<HTMLButtonElement>['onClick'];
}

export default function Pagination({ pagination, onPreviousClick, onNextClick }: IProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
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
  );
}
