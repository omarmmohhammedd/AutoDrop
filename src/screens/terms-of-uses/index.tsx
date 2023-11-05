import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

export default function index() {
  // const { response } = useSelector((state: RootState) => state.globalResponse);
  // const { token } = useSelector((state: RootState) => state.auth);
  return (
    <div className="m-6">
      <h1 className="p-8 text-2xl text-title font-bold">Terms Of Uses</h1>
      <div className={['p-8 space-y-8', 'token' ? 'pt-2' : ''].join(' ')}>
        {/* Title AutoDrop Comitment */}
        <div className="space-y-4">
          <ol style={{ listStyle: 'numbers' }}>
            <p className="mb-5 mb-5 text-xl text-title font-bold">
              Nature of Autodrop's commitment:
            </p>
            <p className="text-sm text-gray-600">
              <li>
                All dealings that take place between the merchant and the consumer have nothing to
                do with the person of AutoDrop, and AutoDrop is not responsible for them, as this
                dealing is an independent contractual relationship that is subject to the agreement
                concluded between the merchant and the consumer. Accordingly, if the consumer fails
                to pay the price of the service or product provided by the merchant, Auto Drop has
                nothing to do with these violations.
              </li>

              <li>
                You know that Auto Drop is a technical website on the Internet that allows the
                merchant who agrees to this agreement to provide his online store with online
                services, and his task ends at this point. There is no responsibility on the Auto
                Drop site for the violations that the merchant makes in his store in violation of
                the provisions of this agreement, and the Auto Drop site has no relationship with
                regard to the transactions that take place between the merchant and the consumer.
              </li>
            </p>
          </ol>

          {/* Conditions of obtaining service */}
          <ol style={{ listStyle: 'numbers' }}>
            <p className="mb-5 text-xl text-title font-bold">
              Conditions for obtaining the service:
            </p>
            <p className="text-sm text-gray-600">
              <li>
                The merchant’s store, which was established in accordance with the agreement to use
                the Auto Drop site, must not be in violation of the laws and regulations in the
                Kingdom of Saudi Arabia, and the merchant is obligated to clarify what business he
                carries out in e-commerce through it, and what services or products he offers or
                sells, and Auto Drop disclaims responsibility for the store’s violation of the
                provisions of the Saudi system in the Kingdom of Saudi Arabia and public morals, and
                the Auto Drop site always has the right to refuse to register any online store that
                does not comply with the laws and regulations in force In the Kingdom of Saudi
                Arabia or the provisions of this agreement, and accordingly, the merchant declares,
                according to the provisions of the agreement, that his shop does not violate public
                order in the Kingdom of Saudi Arabia or Islamic morals.
              </li>
              <li>
                No person has the right to use the Autodrop site if his membership or store has been
                canceled by the Autodrop site or by judicial orders or rulings.
              </li>
            </p>
          </ol>

          {/* Accounts and registration obligations: */}
          <p className="text-2xl text-title font-bold">Accounts and registration obligations:</p>

          {/* Agreements */}
          <ol style={{ listStyle: 'numbers' }}>
            <p className="mb-5 text-xl text-title font-bold">
              Once you apply to join the Auto Drop site, you have agreed to:
            </p>
            <p className="text-sm text-gray-600">
              <li>
                You are responsible for maintaining the confidentiality of your account information
                and the confidentiality of the password, and you agree to inform Auto Drop
                immediately of any unauthorized use of your account information with Auto Drop or
                any other breach of your confidential information.
              </li>
              <li>
                AutoDrop will not be responsible in any way for any loss that may be incurred by
                you, directly or indirectly, moral or material, as a result of disclosing the user
                name or password information, or in the event of misuse of the store.
              </li>
              <li>
                You are obligated to use your account with Auto Drop by yourself, as you are fully
                responsible for it, and if someone else uses it, this means that you have authorized
                them to use it in your name and for your account, unless the merchant informs the
                Auto Drop administration to the contrary.
              </li>
              <li>
                Autodrop has the right, at any time, to conduct any investigations it deems
                necessary, whether directly or through a third party, and to ask you to disclose any
                additional information or documents of any size to prove your identity or ownership
                of your money or your account.
              </li>
              <li>
                In the event of non-compliance with any of the above, the management of the Auto
                Drop site has the right to suspend or cancel your account or membership, or block
                you from accessing the services of the Auto Drop site again. It also reserves the
                right to cancel any unconfirmed and unverified accounts, transactions or accounts
                that have been inactive for a long period of time.
              </li>
              <li>The merchant on the Auto Drop site agrees to communicate with him via e-mail.</li>
            </p>
          </ol>

          {/* payment & services */}
          <ol style={{ listStyle: 'numbers' }}>
            <p className="mb-5 text-xl text-title font-bold">
              Payment and payment services on the Auto Drop website:
            </p>
            <p className="text-sm text-gray-600">
              <li>
                AutoDrop provides, through its partners, a payment system, and payment can be made
                entirely online, through the payment options available on the AutoDrop website, or
                through any payment method provided by the site from time to time.
              </li>
              <li>
                The provision of the Auto Drop website for online payment service via the website is
                for the purpose of facilitation and preserving the rights of merchants.
              </li>
              <li>
                The merchant is obligated to determine the price of the service or goods that he
                displays in his store according to the recognized market value, and Auto Drop has
                nothing to do with the misestimation of the cost of the products or services offered
                in the stores on the Auto Drop site, as its estimate in the commercially recognized
                manner is an obligation on the shoulders of the merchant.
              </li>
              <li>
                Auto Drop has the right to prevent the completion of the procedures for any payment
                process in violation of the rules and provisions of the usage agreement, or to
                cancel any purchase or sale order as a result of a technical or technical error in
                the platform that led to a difference in the prices offered on the site from the
                market value of the product, including a loss for the Auto Drop site, and Auto Drop
                is not responsible for those amounts.
              </li>
              <li>
                The management of Auto Drop has the right to cancel, amend or change any of the
                payment methods that it made available on the site.
              </li>
              <li>
                The merchant is not entitled to refund the plan price if the remaining days of the
                plan exceed (29) days
              </li>
            </p>
          </ol>

          {/* Personal informations */}
          <ol>
            <p className="mb-5 text-xl text-title font-bold">
              Your personal information and transaction details information:
            </p>
            <p className="text-sm text-gray-600">
              <li>
                You are the only one responsible for the information that you have sent or
                published, and the role of the Auto Drop site is limited to allowing you to display
                this information through the Auto Drop site and through its advertising channels.
              </li>
              <li>
                The confidentiality of the information of stores and merchants is subject to the
                rules of the “Privacy Policy and Confidentiality of Information” of the Auto Drop
                site.
              </li>
            </p>
          </ol>

          {/* Technical Support */}
          <ol>
            <p className="mb-5 text-xl text-title font-bold">Technical support:</p>
            <p className="text-sm text-gray-600">
              <li>
                The Auto Drop website allows stores to communicate with the Auto Drop technical
                support team, which helps stores work through the site and solves technical issues
                that may arise in stores.
              </li>
            </p>
          </ol>
        </div>
      </div>
    </div>
  );
}
