import { Icon } from '@iconify/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from 'src/store';

export default function AuthFooter() {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div className="w-full border-t border-t-gray-200 print:hidden">
      <div className="py-4 px-8 space-y-4">
        <div className="w-full flex justify-between gap-3 flex-wrap items-center">
          <ul className="inline-flex gap-3 items-center flex-wrap">
            <li>
              <Link
                to="/pages/terms"
                className="text-sm text-gray-500"
              >
                Terms of uses
              </Link>
            </li>
            <li>
              <Link
                to="/pages/policy-and-privacy"
                className="text-sm text-gray-500"
              >
                Policy and privacy
              </Link>
            </li>
            <li>
              <Link
                to="/pages/faqs"
                className="text-sm text-gray-500"
              >
                FAQs
              </Link>
            </li>
            {!user && (
              <>
                <li>
                  <Link
                    to="/account/login"
                    className="text-sm text-gray-500"
                  >
                    Login to your account
                  </Link>
                </li>

                <li>
                  <Link
                    to="/pricing"
                    className="text-sm text-gray-500"
                  >
                    Pricing
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link
                to="/contact"
                className="text-sm text-gray-500"
              >
                Contact us
              </Link>
            </li>
          </ul>
          <ul className="inline-flex gap-3 items-center flex-wrap">
            <li>
              <Link
                to="https://wa.me/+201557053437"
                className="text-sm text-gray-500 inline-flex items-center gap-2 align-middle"
              >
                <Icon
                  icon="ic:baseline-whatsapp"
                  width={20}
                  height={20}
                />
                <span className="tabular-nums">+201557053437</span>
              </Link>
            </li>
            <li>
              <Link
                to="mailto:support@autodrop.me"
                className="text-sm text-gray-500 inline-flex items-center gap-2 align-middle"
              >
                <Icon
                  icon="majesticons:mail-line"
                  width={20}
                  height={20}
                />
                <span className="tabular-nums">support@autodrop.me</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="border-t border-t-gray-200 pt-4">
          <p className="text-sm text-gray-500 text-center">
            Copyright all rights reserved by{' '}
            <Link
              to="#"
              className="text-secondary"
            >
              Auto drop
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
