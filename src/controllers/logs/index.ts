import { pick } from "lodash";
import { Log, LogSchema } from "../../models/logs.model";
import { NextFunction, Request, Response } from "express";

export async function CreateLog(data: LogSchema, next: NextFunction) {
  try {
    const { body, ...others } = data;
    await Log.create({
      body: JSON.stringify(body),
      ...others,
    });
    next();
  } catch (error) {
    next(error);
  }
}

export async function GetAllLogs(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id } = pick(req.local, ["user_id"]);
    const logs = await Log.paginate({
      merchant: user_id,
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
}
