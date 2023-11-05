import {
  Document,
  PaginateModel,
  Schema,
  SchemaDefinitionProperty,
  Types,
  model,
} from "mongoose";

interface TokenSchema {
  access_token: string;
  refresh_token: string;
  scope: string;
  expires: number;
  store: SchemaDefinitionProperty<Types.ObjectId>;
  userId: SchemaDefinitionProperty<Types.ObjectId>;
}

interface TokenDocument extends Document, TokenSchema {}

const schema = new Schema<TokenSchema>(
  {
    access_token: { type: String, default: null, trim: true },
    refresh_token: { type: String, default: null, trim: true },
    scope: { type: String, default: null, trim: true },
    expires: { type: Number, default: null, trim: true },
    store: { type: String, default: null, ref: "Store", trim: true },
    userId: { type: String, default: null, ref: "User", trim: true },
  },
  { timestamps: true }
);

const Token = model<TokenSchema, PaginateModel<TokenDocument>>(
  "Token",
  schema,
  "tokens"
);

export { Token, TokenDocument, TokenSchema };
