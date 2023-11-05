import { NextFunction, Request, Response } from "express";
import { pick } from "lodash";
import ModelFactor from "../../features/ModelsFactor";
import BaseApi from "../../features/baseApi";
import { Extension } from "../../models/extension.model";

class ExtensionController extends BaseApi {
  async getExtensions(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, search_key } = pick(req.query, ["page", "search_key"]);
      const extensions = await ModelFactor(
        Extension,
        {
          page,
          search_key,
          select: "name type id details createdAt updatedAt logo appId",
        },
        {}
      );

      super.send(res, { extensions });
    } catch (error) {
      next(error);
    }
  }
}

export const { getExtensions } = new ExtensionController();
