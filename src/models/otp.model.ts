import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
  PaginateModel,
} from "mongoose";

interface otpSchema {
  value: string;

  user: SchemaDefinitionProperty<Types.ObjectId>;
}

interface otpDocument extends Document, otpSchema {}

const options = {
  value: {
    type: String,
    default: null,
  },
  user: {
    type: Types.ObjectId,
    default: null,
    ref: "User",
  },
  createdAt: { type: Date, expires: "5m", default: Date.now },
};

const schema = new Schema<otpSchema>(options, { timestamps: true });

const OTP = model<otpSchema, PaginateModel<otpDocument>>("otp", schema, "OTPs");

export { otpSchema, otpDocument, OTP };
