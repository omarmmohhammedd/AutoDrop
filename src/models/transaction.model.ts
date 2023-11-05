import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
  PaginateModel,
} from "mongoose";

interface TransactionSchema {
  status: string;
  details: any;
  tranRef: string;
  amount: number;
  user: SchemaDefinitionProperty<Types.ObjectId>;
  plan: SchemaDefinitionProperty<Types.ObjectId>;
  order: SchemaDefinitionProperty<Types.ObjectId>;
}

interface TransactionDocument extends Document, TransactionSchema {}

const options = {
  status: {
    type: String,
    default: null,
  },
  tranRef: {
    type: String,
    default: null,
  },

  amount: {
    type: Number,
    integer: true,
    default: null,
  },
  user: {
    type: Types.ObjectId,
    default: null,
    ref: "User",
  },
  plan: {
    type: Types.ObjectId,
    default: null,
    ref: "Plan",
  },
  order: {
    type: Types.ObjectId,
    default: null,
    ref: "Order",
  },
};

const schema = new Schema<TransactionSchema>(options, { timestamps: true });

const Transaction = model<
  TransactionSchema,
  PaginateModel<TransactionDocument>
>("Transaction", schema, "Transactions");

export { TransactionSchema, TransactionDocument, Transaction };
