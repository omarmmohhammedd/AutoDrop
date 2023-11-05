import SallaRequest from "../request";

abstract class SallaProductHTTP {
  public CreateProductOptions(product_id: string, data: any, token: string) {
    return SallaRequest({
      url: "products/" + product_id + "/options",
      method: "post",
      data,
      token,
    });
  }

  public GetProductVariants(product_id: string, token: string) {
    return SallaRequest({
      url: "products/" + product_id + "/variants",
      method: "get",
      token,
    });
  }

  public UpdateProductVariant(variant_id: string, data: any, token: string) {
    return SallaRequest({
      url: "products/variants/" + variant_id,
      method: "put",
      data,
      token,
    });
  }

  public DeleteProduct(id: string, token: string) {
    return SallaRequest({
      url: "products/" + id,
      method: "delete",
      token,
    });
  }
}

export default class SallaProducts extends SallaProductHTTP {

  public async CreateProduct(data: any, token: string) {
    const { data: product } = await SallaRequest({
      url: "products",
      method: "post",
      data,
      token,
    });

    const { id, urls, options } = product.data;
    console.log(product)
    const requestOptions = options;
    const originalOptions = data.options;
    const mapOptions = originalOptions.map((ev) => {
      const option = requestOptions.find((e) => e.name === ev.name);
      if (option) {
        const values = ev.values.map((val) => {
          const value = option.values.find(
            (v) => v.display_value === val.display_value
          );
          if (value) {
            return {
              ...value,
              salla_value_id: value.id,
            };
          }
          return val;
        });

        return {
          ...option,
          values,
          salla_option_id: option.id,
        };
      }
      return ev;
    });

    const PRODUCT_OPTIONS =
      await SallaProducts.prototype.GetAndCreateProductOptions(
        mapOptions,
        id,
        token
      );

    return { updatedOptions: PRODUCT_OPTIONS, id, urls };
  }

  private async GetAndCreateProductOptions(
    options: any,
    id: string,
    token: string
  ): Promise<any[]> {

    const mapOptions = await Promise.all(
      options.map(async (option) => {
        const { id: optionID, values } = option;
        console.log(id)
        const productValues =
          await SallaProducts.prototype.UpdateProductVariants(
            values,
            id,
            token
          );

        return {
          ...option,
          values: productValues,
        };
      })
    );

    console.log("options => \n");

    return mapOptions;
  }

  private async UpdateProductVariants(
    values: any,
    id: string,
    token: string
  ): Promise<any[]> {
    const { data } = await super.GetProductVariants(id, token);
    const variants: any[] = data.data;

    const mapValues = await Promise.all(
      values.map(async (value) => {
        const { salla_value_id, price, quantity } = value;
        const variant = variants.find((ev) =>
          ev?.related_option_values?.includes(salla_value_id)
        );
        const variantID = variant.id;
        const skuWithBarcode = ["vl", salla_value_id, variantID].join("-");
        const randomValue = salla_value_id?.toString()?.slice(0, 8);



        const body = {
          sku: skuWithBarcode,
          barcode: skuWithBarcode,
          price: price,
          sale_price: price,
          regular_price: price,
          stock_quantity: quantity,
          mpn: randomValue,
          gtin: randomValue,
        };

        const { data } = await super.UpdateProductVariant(
          variantID,
          body,
          token
        );

        return {
          ...value,
          salla_variant_id: variantID,
        };
      })
    );

    console.log("values => \n");
    // console.table(mapValues);
    return mapValues;
  }
}
