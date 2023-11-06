import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { orderBy } from "lodash";
import findSettingKey from "./settings";

dotenv.config();

const { TAB_KEY, TAB_BASE } = process.env;

  
interface Customer {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone?: { country_code: string | number; number: string | number };
  description?: string;
  metadata?: any;
  currency?: string;
}

interface ItemType {
  amount: string | number;
  currency?: string;
  description?: string;
  quantity: number;
  name: string;
  image?: string;
}

interface OrderType {
  amount: string | number;
  currency?: string;
  items: Array<ItemType>;
  tax?: any;
  id?:any
}

// *****Charging ******

// SourceType interface
interface Source {
  id: string;
}

interface ChargeType {
  description?: string;
  currency: string;
  customer: Customer;
  order: OrderType;
  post: string;
  redirect: string;
  ref_order: string;
  source: Source;
  amount: number;
  metadata?:any
}

// *****End Charge interfaces ******

interface InvoiceType {
  draft: boolean;
  due: string | number;
  expiry: string | number;
  description?: string;
  mode: string;
  currencies?: string[];
  customer: string;
  order: OrderType;
  post: string;
  redirect: string;
  ref_invoice: string;
  ref_order: string;
}

export default class TabPayment {
  private currency: string;
  constructor() {
    this.currency = "SAR";
  }

  private async CreateRequest({
    method,
    pathname,
    body,
  }: {
    pathname: string;
    method: string;
    body: any;
  }) {
    const TAB_TOKEN = await findSettingKey('TAB_TOKEN')
    return axios({
      url: TAB_BASE + pathname,
      method: method,
      data: body,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: "Bearer " + TAB_TOKEN,
      },
    });
  }

  CreateInvoice(body: InvoiceType): Promise<any> {
    const {
      currencies,
      order,
      post,
      redirect,
      ref_invoice,
      ref_order,
      customer,

      ...data
    } = body;
    const payload = {
      ...data,
      currencies: [this.currency],
      order: {
        ...order,
        currency: this.currency,
        items: order.items?.map((e) => ({ ...e, currency: this.currency })),
        id:order.id
      },
      ...(post && {
        post: {
          url: post,
        },
      }),
      ...(redirect && {
        redirect: {
          url: redirect,
        },
      }),
      reference: {
        invoice: ref_invoice,
        order: ref_order,
      },
      customer: {
        // email: "frontdev0219@gmail.com",
        // first_name: "test",
        // last_name: "test",
        // middle_name: "test",
        id: customer,
      },
      charge: {
        receipt: {
          email: true,
          sms: true,
        },
      },
      payment_methods: ["MADA", "VISA"],
    };

    return this.CreateRequest({
      pathname: "invoices",
      method: "post",
      body: payload,
    });
  }

  GetChargeDetails(id: string): Promise<any> {
    return this.CreateRequest({
      pathname: "charges/" + id,
      method: "get",
      body: undefined,
    });
  }
  GetInvoiceDetails(id: string): Promise<any> {
    return this.CreateRequest({
      pathname: "invoices/" + id,
      method: "get",
      body: undefined,
    });
  }

  CreateCustomer(body: Customer): Promise<any> {
    return this.CreateRequest({
      pathname: "customers",
      method: "post",
      body: JSON.stringify({ ...body, currency: this.currency }),
    });
  }

  // *****Start CreateCharge ******
  CreateCharge(body: ChargeType): Promise<any> {
    const {
      currency,
      post,
      redirect,
      ref_order,
      order,
      customer,
      amount, // *important --> The amount charge
      ...data
    } = body;

    const payload = {
      ...data,
      currency: this.currency,
      amount: order.amount,
      order: {
        ...order,
        currency: this.currency,
        items: [], // No need for items in charge
      },
      ...(post && {
        post: {
          url: post, //https://689e-197-252-211-103.ngrok-free.app/api/v1/payments/callback/subscriptions
        },
      }),
      ...(redirect && {
        redirect: {
          url: redirect,
        },
      }),
      reference: {
        order: ref_order,
      },
      customer,
      charge: {
        receipt: {
          email: true,
          sms: true,
        },
      },
      source: {
        id: "src_all",
      },
      // payment_method: []
    };
    return this.CreateRequest({
      pathname: "charges",
      method: "post",
      body: payload,
    });
    // *****End CreateCharge ******
  }
}
