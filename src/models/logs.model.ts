import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
  PaginateModel,
} from "mongoose";

interface LogSchema {
  event: string;
  body: string;
  status: string;
  method: string;
  others: string;
  merchant: SchemaDefinitionProperty<Types.ObjectId>;
}

interface LogDocument extends Document, LogSchema {}

const options = {
  event: { type: String, default: null, trim: true },
  body: { type: String, default: null, trim: true },
  status: { type: String, default: null, trim: true },
  method: { type: String, default: null, trim: true },
  others: { type: String, default: null, trim: true },
  merchant: { type: String, default: null, ref: "User", trim: true },
};

const schema = new Schema<LogSchema>(options, { timestamps: true });

const Log = model<LogSchema, PaginateModel<LogDocument>>("Log", schema, "logs");

export { LogSchema, LogDocument, Log };
