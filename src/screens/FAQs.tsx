import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import DisclosureShared from 'src/components/shared/Disclosure';
export default function FAQs() {
  // const { response } = useSelector((state: RootState) => state.globalResponse);
  // const { token } = useSelector((state: RootState) => state.auth);

  // Static FAQs
  const faqs = [
    {
      question_en: 'What is AutoDrop?',
      question_ar: '',
      answer_en:
        'AutoDrop is a website established in 2023 in order to facilitate and facilitate the e-commerce process for merchants, as it provides them with the service of automatic linking between their store and the famous sites and platforms that support dropshipping.',
      answer_ar: '-'
    },
    {
      question_en: 'What are Auto Drop services?',
      question_ar: '',
      answer_en: `
      1- The merchant installs our application through the platform he is using<br /><br />
      2- An account is automatically registered for the merchant immediately after installing the application, and the login data for the Auto Drop website is sent via the email used in the same platform used<br /><br />
      3- The merchant chooses the appropriate package for him and subscribes to it<br /><br />
      4- The merchant links the products he buys from the Ali Express website by adding the product URL (https://aliexpress.com/item/....) and adjusts the product data as he likes before uploading and linking it.<br /><br />
      5- When there are orders on the merchant’s store, they are automatically transferred to his account in AutoDrop with all the data (the merchant must pay the price of the original product - before increasing the merchant’s profit - in order to complete the order automatically<br /><br />
      6- All product data linked to the merchant's store is automatically updated and synchronized every short period<br /><br />
      7- When the status of the order is updated by the supplier, its status is automatically synchronized in the merchant’s account in AutoDrop and from there to his store in the used platform.
      `,
      answer_ar: '-'
    },
    {
      question_en: 'Can I try the site for free?',
      question_ar: '-',
      answer_en: 'Yes, through the basic plan.',
      answer_ar: '-'
    },
    {
      question_en: 'How do I contact support?',
      question_ar: '',
      answer_en: 'You can write to us via the WhatsApp icon below, or by emailing us.',
      answer_ar: ''
    }
  ];

  return (
    <div className={['p-8 space-y-8', '' ? 'pt-2' : ''].join(' ')}>
      <div className="space-y-4">
        <p className="text-center text-4xl text-title font-bold">Support Center</p>
        <p className="text-center text-lg text-gray-500">How we can help you? </p>
      </div>
      <ul className="w-full max-w-screen-md mx-auto space-y-4">
        {faqs.map((item: any, index: number) => (
          <li key={index}>
            <DisclosureShared title={item.question_en}>
              <p
                className="text-sm text-gray-600"
                dangerouslySetInnerHTML={{
                  __html: item.answer_en
                }}
              ></p>
            </DisclosureShared>
          </li>
        ))}
      </ul>
    </div>
  );
}
