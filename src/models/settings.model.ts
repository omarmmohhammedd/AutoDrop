import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
  PaginateModel,
} from "mongoose";

interface settingsSchema {
  value: string;
  key: string;
  label: string;
}

interface settingsDocument extends Document, settingsSchema {}

const options = {
  value: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    trim: true,
  },
  key: {
    type: String,
    default: null,
  },
};

const schema = new Schema<settingsSchema>(options, { timestamps: true });

const Setting = model<settingsSchema, PaginateModel<settingsDocument>>(
  "setting",
  schema,
  "settings"
);

export { settingsSchema, settingsDocument, Setting };
