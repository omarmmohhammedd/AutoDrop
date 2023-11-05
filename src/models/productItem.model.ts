import {
  AggregatePaginateModel,
  Document,
  Schema,
  SchemaDefinitionProperty,
  Types,
  model,
} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface ProductItemSchema {
  productId: SchemaDefinitionProperty<Types.ObjectId>;
  options: SchemaDefinitionProperty<Types.ObjectId[]>;
  userId: SchemaDefinitionProperty<Types.ObjectId>;
  store_product_id: string;
  vendor_commission: number;
}

interface ProductItemDocument extends Document, ProductItemSchema {}

const options = {
  productId: { type: Types.ObjectId, ref: "Product", default: null },
  userId: { type: Types.ObjectId, ref: "User", default: null },
  options: { type: Array, default: [] },
  store_product_id: { type: String, default: null, trim: true },
  vendor_commission: { type: Number, default: 0, integer: true },
};

const schema = new Schema<ProductItemSchema>(options, { timestamps: true });
schema.index({ "$**": "text" });

schema.plugin(mongooseAggregatePaginate);

const ProductItem = model<
  ProductItemSchema,
  AggregatePaginateModel<ProductItemDocument>
>("ProductItem", schema, "productItems");

export { ProductItem, ProductItemDocument };
