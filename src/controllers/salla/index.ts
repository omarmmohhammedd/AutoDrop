import { NextFunction, Request, Response } from "express";
import { pick } from "lodash";
import { SABranches } from "../../queues";

export async function syncBranches(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id, access_token } = pick(req.local, [
      "user_id",
      "access_token",
    ]);
    res.send("Queue started to sync your branches");


    await SABranches.add({
      user_id,
      token: access_token,
    });
  } catch (error) {
    next(error);
  }
}
