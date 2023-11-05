import { Document, PaginateModel, Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

type ExtensionType = "salla" | "zed";

interface ExtensionSchema {
  type: ExtensionType;
  access_token: string;
  appId: string;
  refresh_token: string;
  expires: string;
  client_id: string;
  client_secret: string;
  client_api_key: string;
  name: string;
  baseUrl: string;
  details: string;
  logo: string;
  webhookSignature: string;
}

interface ExtensionDocument extends Document, ExtensionSchema {}

const schema = new Schema<ExtensionSchema>(
  {
    type: { type: String, default: "salla", trim: true },
    appId: { type: String, default: null, trim: true },
    access_token: { type: String, default: null, trim: true },
    refresh_token: { type: String, default: null, trim: true },
    expires: { type: String, default: null, trim: true },
    client_id: { type: String, default: null, trim: true },
    client_secret: { type: String, default: null, trim: true },
    client_api_key: { type: String, default: null, trim: true },
    name: { type: String, default: null, trim: true },
    baseUrl: { type: String, default: null, trim: true },
    logo: { type: String, default: null, trim: true },
    details: { type: String, default: null, trim: true },
    webhookSignature: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

schema.index({ "$**": "text" });
schema.plugin(mongoosePaginate);

const Extension = model<ExtensionSchema, PaginateModel<ExtensionDocument>>(
  "Extension",
  schema,
  "extensions"
);

export { Extension, ExtensionDocument, ExtensionSchema };
