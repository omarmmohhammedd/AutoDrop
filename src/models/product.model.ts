import {
  Schema,
  model,
  Document,
  Types,
  SchemaDefinitionProperty,
  PaginateModel,
} from "mongoose";

interface ImageType {
  original: string;
  thumbnail: string;
  default: boolean;
  alt: string;
}

interface ValueType {
  name: string;
  price: number;
  original_price: number;
  quantity: number;
  is_default: boolean;
  property_id: number;
  sku_id: number;
  salla_value_id?: string;
  salla_variant_id?: string;
  mpn?: string | number;
  gtin?: string | number;
  display_value: string;
  sku: string;
}

interface OptionType {
  name: string;
  display_type: string;
  values: ValueType[];
  salla_option_id: string;
}

interface ShippingAttributes {
  name: string;
  price: number;
}

interface ProductSchema {
  name: string;
  description: string;
  price: number;
  main_price: number;
  vendor_commission: number;
  vendor_price: number;
  quantity: number;
  sku: string;
  images: SchemaDefinitionProperty<ImageType[] | null>;
  options: SchemaDefinitionProperty<OptionType[] | null>;
  metadata_title: string;
  metadata_description: string;
  product_type: string;
  original_product_id: number | string;
  salla_product_id: number | string;
  merchant: SchemaDefinitionProperty<Types.ObjectId>;
  require_shipping: boolean;
  shipping: ShippingAttributes;
}

interface ProductDocument extends Document, ProductSchema {}

const options = {
  name: { type: String, default: null, trim: true },
  description: { type: String, default: null, trim: true },
  price: { type: Number, default: 0, integer: true },
  main_price: { type: Number, default: 0, integer: true },
  vendor_commission: { type: Number, default: 0, integer: true },
  vendor_price: { type: Number, default: 0, integer: true },
  quantity: { type: Number, default: 0, integer: true },
  sku: { type: String, default: null, trim: true },
  images: { type: Array, default: [] },
  options: { type: Array, default: [] },
  metadata_title: { type: String, default: null, trim: true },
  metadata_description: { type: String, default: null, trim: true },
  product_type: { type: String, default: null, trim: true },
  original_product_id: {
    type: String || Number,
    default: null,
    trim: true,
    integer: true,
  },
  salla_product_id: {
    type: String || Number,
    default: null,
    trim: true,
    integer: true,
  },
  merchant: { type: String, default: null, ref: "User", trim: true },
  require_shipping: {
    type: Boolean,
    default: true,
  },
  shipping: {
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
  },
};

const schema = new Schema<ProductSchema>(options, { timestamps: true });
schema.index({ "$**": "text" });

const Product = model<ProductSchema, PaginateModel<ProductDocument>>(
  "Product",
  schema,
  "products"
);

export {
  Product,
  ProductSchema,
  ProductDocument,
  ImageType,
  ValueType,
  OptionType,
};
