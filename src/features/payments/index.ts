import { config } from "dotenv";
import axios from "axios";

config();

const {
  PT_PROFILE_ID,
  PT_MERCHANT_ID,
  PT_SERVER_KEY,
  PT_BASE,
  PT_CURRENCY,
  LOCAL_HTTP_WEBSOCKET,
} = process.env;

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}
type TransactionTypes = "refund" | "void" | "release" | "capture" | "sale";

export class PayTabPayment {
  CreatePaymentPage(
    id: string,
    amount: number,
    customer: CustomerDetails,
    pathname: string,
    description?: string
  ): Promise<any> {
    return axios({
      url: PT_BASE + "payment/request",
      method: "post",
      headers: {
        Authorization: PT_SERVER_KEY,
      },
      data: {
        profile_id: PT_PROFILE_ID,
        tran_type: "sale",
        tran_class: "ecom",
        cart_id: id,
        cart_currency: PT_CURRENCY,
        cart_amount: amount,
        cart_description: description,
        paypage_lang: "en",
        customer_details: customer,
        return: LOCAL_HTTP_WEBSOCKET + pathname,
        payment_methods: ["mada", "applepay", "visa", "creditcard", "stcpay"],
      },
    });
  }

  CreateTransaction(
    type: TransactionTypes,
    id: string,
    tranRef: string,
    amount: number,
    // return_url: string,
    description?: string
  ): Promise<any> {
    return axios({
      url: PT_BASE + "payment/request",
      method: "post",
      headers: {
        Authorization: PT_SERVER_KEY,
      },
      data: {
        profile_id: PT_PROFILE_ID,
        tran_ref: tranRef,
        cart_id: id,
        tran_type: type,
        tran_class: "ecom",
        cart_currency: PT_CURRENCY,
        cart_amount: amount,
        cart_description: description,
      },
    });
  }

  GetPaymentDetails(tranRef: string): Promise<any> {
    return axios({
      url: PT_BASE + "payment/query",
      method: "post",
      headers: {
        Authorization: PT_SERVER_KEY,
      },
      data: {
        profile_id: PT_PROFILE_ID,
        tran_ref: tranRef,
      },
    });
  }
}
