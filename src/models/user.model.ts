import { PaginateModel } from "mongoose";
import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
} from "mongoose";

import mongoosePaginate from "mongoose-paginate-v2";

type UserType = "admin" | "vendor";

interface UserSchema {
  name: string;
  email: string;
  mobile: string;
  password: string;
  tokens: string;
  merchantId: string;
  meta: any;
  storeName: string;
  website: string;
  avatar: string;
  userInfo: string;
  userType: UserType;
  deletedAt?: Date | null;
  pt_customer_id: string;
}

interface UserDocument extends Document, UserSchema {}

const options = {
  name: { type: String, default: null, trim: true },
  email: {
    type: String,
    default: null,
    trim: true,
    unique: true,
  },
  mobile: { type: String, default: null, trim: true },
  password: { type: String, default: null, trim: true },
  tokens: { type: String, default: null, trim: true },
  merchantId: { type: String, default: null, trim: true },
  meta: { type: String, default: null, trim: true },
  storeName: { type: String, default: null, trim: true },
  website: { type: String, default: null, trim: true },
  avatar: { type: String, default: null, trim: true },
  userInfo: { type: String, default: null, trim: true },
  pt_customer_id: { type: String, default: null, trim: true },
  userType: {
    type: String,
    default: null,
    trim: true,
    enum: ["admin", "vendor"],
  },
  deletedAt: {
    type: Date,
    default: null,
  },
};

const schema = new Schema<UserSchema>(options, { timestamps: true });
schema.index({ "$**": "text" });

schema.plugin(mongoosePaginate);

const User = model<UserSchema, PaginateModel<UserDocument>>(
  "User",
  schema,
  "users"
);

export { User, UserType, UserSchema, UserDocument };
