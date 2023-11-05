import { Router } from "express";
import { getExtensions } from "../../controllers/extensions";
import Authentication from "../../middlewares/authentication";

const extensionsRouter = Router();

extensionsRouter.get("/all", Authentication(), getExtensions);

export default extensionsRouter;
