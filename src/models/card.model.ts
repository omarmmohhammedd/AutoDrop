import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
  PaginateModel,
} from "mongoose";

interface CardSchema {
  card_id: string;
  token_id: string;
  customer_id: string;
  card_placeholder: string;
  card_exp: string;
  is_default: boolean;
  user_id: SchemaDefinitionProperty<Types.ObjectId>;
}

interface CardDocument extends Document, CardSchema {}

const options = {
  card_id: {
    type: String,
    default: null,
  },
  token_id: {
    type: String,
    default: null,
  },
  customer_id: {
    type: String,
    default: null,
  },
  card_placeholder: {
    type: String,
    default: null,
  },
  card_exp: {
    type: String,
    default: null,
  },
  is_default: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Types.ObjectId,
    default: null,
    ref: "User",
  },
};

const schema = new Schema<CardSchema>(options, { timestamps: true });

const Card = model<CardSchema, PaginateModel<CardDocument>>(
  "Card",
  schema,
  "Cards"
);

export { CardSchema, CardDocument, Card };
