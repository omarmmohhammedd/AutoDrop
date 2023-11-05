import { createHmac } from "crypto";
import dotenv from "dotenv";
dotenv.config();
import qs from "qs";

const { ALI_SECRET }: any = process.env;
export function GenerateValues(params: any) {
  const keys = (obj: any) => Object.keys(obj).sort();
  const GenerateParams = (obj: any) =>
    keys(obj)
      .map((key: any) => {
        const item = obj[key];

        if (item instanceof Object) {
          // return key + encodeURIComponent(JSON.stringify(item));
          return key + GenerateParams(item);
        }

        return key + item;
      })
      .join("");

  const string = GenerateParams(params);
  return string;
}

export function GenerateSign(value: string) {
  const digest = createHmac("sha256", ALI_SECRET).update(value).digest("hex");
  return digest.toUpperCase();
}
