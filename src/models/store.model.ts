import {
  Document,
  PaginateModel,
  Schema,
  SchemaDefinitionProperty,
  Types,
  model,
} from "mongoose";

interface StoreSchema {
  logo: string;
  name: string;
  username: string;
  website: string;
  tax_number: string;
  commercial_number: string;
  installation_date: Date;
  merchant: string;
  extension: SchemaDefinitionProperty<Types.ObjectId>;
  userId: SchemaDefinitionProperty<Types.ObjectId>;
}

interface StoreDocument extends Document, StoreSchema {}

const schema = new Schema<StoreSchema>(
  {
    logo: { type: String, default: null, trim: true },
    name: { type: String, default: null, trim: true },
    username: { type: String, default: null, trim: true },
    website: { type: String, default: null, trim: true },
    tax_number: { type: String, default: null, trim: true },
    commercial_number: { type: String, default: null, trim: true },
    merchant: { type: String, default: null, trim: true },
    installation_date: { type: Date, default: null, trim: true },
    extension: { type: String, default: null, ref: "Extension", trim: true },
    userId: { type: String, default: null, ref: "User", trim: true },
  },
  { timestamps: true }
);

const Store = model<StoreSchema, PaginateModel<StoreDocument>>(
  "Store",
  schema,
  "stores"
);

export { Store, StoreDocument, StoreSchema };
