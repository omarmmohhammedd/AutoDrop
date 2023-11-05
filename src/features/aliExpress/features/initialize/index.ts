import axios from "axios";
import dayjs from "dayjs";
import { pick } from "lodash";
import mongoose, { ClientSession } from "mongoose";
import ApiError from "../../../../errors/ApiError";
import { Setting } from "../../../../models/settings.model";
import { GenerateSign, GenerateValues } from "../GenerateSignature";

export async function updateToken() {
  return new Promise(async (resolve, reject) => {
    let session: ClientSession | null = null;
    session = await mongoose.startSession();
    session.startTransaction();

    try {
      const keys = await Setting.find({
        key: {
          $in: ["ALI_APP_KEY", "ALI_REFRESH_TOKEN", "ALI_SECRET", "ALI_BASE"],
        },
      }).exec();

      if (!keys || !keys.length)
        return reject(
          new ApiError("InternalServerError", "Application not installed")
        );

      const app_key = findSettingItem(keys, "ALI_APP_KEY");
      const refresh_token = findSettingItem(keys, "ALI_REFRESH_TOKEN");
      const secret = findSettingItem(keys, "ALI_SECRET");
      const base = findSettingItem(keys, "ALI_BASE");

      const timestamp = new Date(
        dayjs().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")
      ).getTime();
      const method = "/auth/token/refresh";
      const body = {
        app_key,
        refresh_token,
        sign_method: "sha256",
        timestamp,
        method,
      };

      const values = GenerateValues(body);
      const sign = GenerateSign(values);
      const { data } = await axios.get(base, {
        params: { ...body, sign },
      });

      const key = method + "_response";
      const result = data[key];
      const error = data.error_response;
      console.log(error)
      if (error)
        throw new ApiError(
          "UnprocessableEntity",
          error.msg || "Something went wrong while updating application tokens"
        );

      const {
        access_token,
        refresh_token: _refresh_token,
        expire_time,
        refresh_token_valid_time,
      } = pick(result, [
        "access_token",
        "refresh_token",
        "expire_time",
        "refresh_token_valid_time",
      ]);

      const AEKeys = [
        {
          key: "ALI_TOKEN",
          value: access_token,
          start_date: Date.now(),
          end_date: expire_time,
        },
        {
          key: "ALI_REFRESH_TOKEN",
          value: _refresh_token,
          start_date: Date.now(),
          end_date: refresh_token_valid_time,
        },
      ];
      // delete aliexpress keys first
      await Setting.deleteMany(
        {
          key: {
            $in: ["ALI_TOKEN", "ALI_REFRESH_TOKEN"],
          },
        },
        { session }
      );

      // store all new values by keys
      await Setting.insertMany(AEKeys, { session });

      await session.commitTransaction();
      resolve("Application tokens updated successfully.");
    } catch (error) {
      await session.abortTransaction();
      console.log(error)
      reject(error);
    } finally {
      await session.endSession();
    }
  });
}

function findSettingItem(items: any[], key: string) {
  const item = items.find((item: any) => item.key == key);
  return item?.value;
}
