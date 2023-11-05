import crypto from "crypto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";
import { GenerateValues, GenerateSign } from "./features/GenerateSignature";
import qs from "qs";
import findSettingKey from "../settings";

dayjs.extend(utc);
dayjs.extend(timezone);

export default async function MakeRequest(values: any): Promise<any> {
  const timestamp = new Date(
    dayjs().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")
  ).getTime();

  const [ALI_APP_KEY, ALI_BASE, ALI_TOKEN, ALI_REFRESH] = await Promise.all([
    findSettingKey("ALI_APP_KEY"),
    findSettingKey("ALI_BASE"),
    findSettingKey("ALI_TOKEN"),
    findSettingKey("ALI_REFRESH_TOKEN"),
  ]);

  const data = {
    ...values,
    app_key: ALI_APP_KEY,
    access_token: ALI_TOKEN,
    timestamp,
  };

  const sign = GenerateSign(GenerateValues(data));

  return axios({
    url: ALI_BASE + "/" + values?.method,
    method: "post",
    data: {
      ...data,
      sign,
    },
  });
}
