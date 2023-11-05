import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';

export default function index() {
  // const { response } = useSelector((state: RootState) => state.globalResponse);
  // const { token } = useSelector((state: RootState) => state.auth);

  return (
    <div className="pl-4">
      <h1 className="p-8 text-2xl text-title font-bold">Policy And Privacy</h1>
      <div className={['p-8 space-y-8', 'token' ? 'pt-2' : ''].join(' ')}>
        {/* one */}
        <p className="mb-3 text-xl text-title font-bold">
          Information that AutoDrop obtains and maintains in its systems:
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Consumer personal information, such as name, e-mail address. Merchant's personal
            information, such as name and email. In the event that the merchant does not provide the
            required information, Auto Drop may try to obtain it through other sources.
          </p>
        </div>

        {/* two */}
        <p className="mb-3 text-xl text-title font-bold">
          Revenue information, goods or services for stores:
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Auto Drop is always aware of the revenue generated in the store, because the merchant
            uses the payment gateways provided by Auto Drop. AutoDrop is aware of the type of goods
            or services offered on the store platform. Auto Drop is aware of the performance of the
            stores, in the event that there is a need to direct support, advice and guidance to
            merchants or stores to help them and improve their performance.
          </p>
        </div>

        {/* three */}
        <p className="mb-3 text-xl text-title font-bold">
          Sharing information about stores and merchants:
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Of course, Auto Drop seeks to keep this information in a way that preserves the privacy
            of the merchant, and Auto Drop does not keep this information except with the aim of
            improving the quality of the site and the quality of the work of the stores and in order
            to facilitate and facilitate the work of merchants and stores. As a general rule, all of
            this information is only seen by some of those in charge of AutoDrop, after obtaining a
            permit to view it from the AutoDrop administration - the permit is usually specific and
            restricted and subject to legal and administrative control by AutoDrop - and this
            information will not be published or broadcast to others. As Auto Drop seeks to preserve
            the safety of stores and the rights of merchants, it - in the event that Auto Drop
            notices any illegal or illegal activity by the merchant - Auto Drop shares any of this
            information with the competent authorities to take the necessary action against the
            violating merchant or store, in order to protect Auto Drop and other merchants, stores
            and consumers from any legal liability that may occur on the site or one of its users as
            a result of this illegal or irregular activity.
          </p>
        </div>

        {/* four */}
        <p className="mb-3 text-xl text-title font-bold">
          How secure is the confidentiality of information for merchants, consumers or stores:
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Auto Drop seeks to maintain the confidentiality of the information of the users of the
            site, and since the privacy policy of merchants or stores will not violate the privacy
            policy and confidentiality of information. However, since this cannot be guaranteed 100%
            in (internet space), the Auto Drop team notes the following: Auto Drop seeks to preserve
            all information about stores and not to be seen by anyone in violation of the policy in
            force in Auto Drop. Auto Drop works to protect the information of merchants and stores
            according to high-quality technical protection systems that are continuously and
            periodically updated. However, since the Internet cannot be 100% guaranteed due to the
            penetration or viruses that may occur on the protection systems and firewalls in force
            in Auto Drop, Auto Drop advises merchants to keep their information strictly
            confidential, and not to disclose any information that the merchant deems very important
            to him, and this is in the interest of Auto Drop to protect, guide and guide merchants
            and stores.
          </p>
        </div>

        {/* five */}
        <p className="mb-3 text-xl text-title font-bold">
          Rules and provisions for using AutoDrop:
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            All the obligations of Auto Drop, all the obligations of merchants, and all the rights
            contained in the relationship between the merchant and Auto Drop, as these rules are the
            “Privacy Policy and Confidentiality of Information.” The privacy policy and
            confidentiality of information has been developed to ensure the credibility and trust
            that Auto Drop is keen to provide to merchants.
          </p>
        </div>
      </div>
    </div>
  );
}
