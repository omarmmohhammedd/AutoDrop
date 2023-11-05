import axios from "axios";
import dayjs from "dayjs";
import { NextFunction, Request, Response } from "express";
import { pick } from "lodash";
import moment from "moment";
import mongoose, { ClientSession } from "mongoose";
import ApiError from "../../errors/ApiError";
import {
  GenerateSign,
  GenerateValues,
} from "../../features/aliExpress/features/GenerateSignature";
import BaseApi from "../../features/baseApi";
import findSettingKey from "../../features/settings";
import { Setting } from "../../models/settings.model";

class AliExpressController extends BaseApi {
  async initializeApp(req: Request, res: Response, next: NextFunction) {
    let session: ClientSession | null = null;
    session = await mongoose.startSession();
    session.startTransaction();

    try {
      const timestamp = new Date(
        dayjs().tz("Asia/Riyadh").format("YYYY-MM-DD HH:mm:ss")
      ).getTime();
      const { code, app_key, secret } = pick(req.body, [
        "code",
        "app_key",
        "secret",
      ]);
      const method = "/auth/token/create";

      const data = {
        code,
        app_key,
        uuid: "code" + app_key,
        sign_method: "sha256",
        timestamp,
        method,
      };

      const base = await findSettingKey("ALI_BASE");

      const values = GenerateValues(data);
      const sign = GenerateSign(values);
      const params = {
        ...data,
        sign,
      };

      const result = await axios.post(base, params);
      const response = result.data;
      const initResponse = response[method + "_response"];
      const error = response.error_response;

      if (error) {
        const message = error.msg
          ? { error: error.msg }
          : "Something went wrong while linking by authentication code, secret and app key, try again later or try another code.";
        throw new ApiError("UnprocessableEntity", message);
      }

      const {
        access_token,
        refresh_token,
        expire_time,
        refresh_token_valid_time,
      } = pick(initResponse, [
        "access_token",
        "refresh_token",
        "expire_time",
        "refresh_token_valid_time",
      ]);

      const codeExpireDate = moment().add(30, "minutes").toDate().getTime();
      const AEKeys = [
        {
          key: "ALI_TOKEN",
          value: access_token,
          start_date: Date.now(),
          end_date: expire_time,
        },
        {
          key: "ALI_APP_KEY",
          value: app_key,
        },
        {
          key: "ALI_SECRET",
          value: secret,
        },
        {
          key: "ALI_REFRESH_TOKEN",
          value: refresh_token,
          start_date: Date.now(),
          end_date: refresh_token_valid_time,
        },
        {
          key: "ALI_AUTH_CODE",
          value: code,
          start_date: Date.now(),
          end_date: codeExpireDate,
        },
      ];
      // delete aliexpress keys first
      await Setting.deleteMany(
        {
          key: {
            $in: [
              "ALI_TOKEN",
              "ALI_REFRESH_TOKEN",
              "ALI_AUTH_CODE",
              "ALI_SECRET",
              "ALI_APP_KEY",
            ],
          },
        },
        { session }
      );

      // store all new values by keys
      await Setting.insertMany(AEKeys, { session });

      await session.commitTransaction();

      super.send(res, "Application initialized successfully");
    } catch (error) {
      console.log(error);
      next(error);
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  }
}

export const { initializeApp } = new AliExpressController();
