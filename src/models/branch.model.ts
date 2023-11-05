import {
  Document,
  PaginateModel,
  Schema,
  SchemaDefinitionProperty,
  Types,
  model,
} from "mongoose";

type Location = {
  lat: number;
  lng: number;
};

interface BranchSchema {
  name: string;
  address: string;
  postal_code: string;
  contacts: string;
  location: Location;
  street: string;
  country: any;
  city: any;
  userId: SchemaDefinitionProperty<Types.ObjectId>;
}

interface BranchDocument extends Document, BranchSchema {}

const schema = new Schema<BranchSchema>(
  {
    name: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },
    postal_code: { type: String, default: null, trim: true },
    contacts: { type: String, default: null, trim: true },
    location: { type: Map, default: null, trim: true },
    street: { type: String, default: null, trim: true },
    country: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },

    userId: { type: String, default: null, ref: "User", trim: true },
  },
  { timestamps: true }
);

const Branch = model<BranchSchema, PaginateModel<BranchDocument>>(
  "Branch",
  schema,
  "branches"
);

export { Branch, BranchDocument, BranchSchema as BranchSchema };
