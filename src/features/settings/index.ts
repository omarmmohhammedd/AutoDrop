import ApiError from "../../errors/ApiError";
import { Setting } from "../../models/settings.model";

export default function findSettingKey(key: string): Promise<string | null> {
  return new Promise(async (resolve, reject) => {
    const document = await Setting.findOne({ key }).exec();
    if (!document)
      return reject(
        new ApiError(
          "NotFound",
          "Service is not found or unavailable at that moment"
        )
      );
    return resolve(document.value);
  });
}
