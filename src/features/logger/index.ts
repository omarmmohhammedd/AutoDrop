import * as fs from "fs";
import * as path from "path";
import { stringify } from "flatted";

export default class Logger {
  public print(result: any) {
    const direction = path.join(__dirname, "result");
    const filename = new Date().getTime() + ".json";
    const location = path.join(direction, filename);
    const isDirectionExisted = fs.existsSync(direction);
    const data = stringify(result, null, 4);

    if (!isDirectionExisted) {
      fs.mkdirSync(direction);
    }

    fs.writeFileSync(location, data, {
      encoding: "utf-8",
    });
    return this;
  }
}
