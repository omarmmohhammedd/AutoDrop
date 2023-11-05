import { NextFunction, Router, Request, Response } from "express";
import Authentication from "../../middlewares/authentication";
import {
  GetDashboard,
  GetStaticSettings,
  GetServerKeys,
  UpdateServerKeys,
  urlToken,
} from "../../controllers/root";
import { pick } from "lodash";
import generateOptions from "../../features/email/generateOptions";
import { ContactMessageKeys, messages } from "../../responses/messages";
import SendEmail from "../../features/email/send";
import { CheckValidationSchema } from "../../middlewares/CheckValidationSchema";
import { body } from "express-validator";


const rootRouter: Router = Router();

rootRouter.get("/dashboard", Authentication(), GetDashboard);
rootRouter.get("/settings", GetStaticSettings);
rootRouter.get("/settings/keys", GetServerKeys);
rootRouter.get('/settings/token',urlToken)
rootRouter.post("/settings/keys/update", UpdateServerKeys);

rootRouter.post(
  "/contact",
  ...[
    body("name").exists().withMessage("Name is required"),
    body("email")
      .exists()
      .withMessage("email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    body("mobile").exists().withMessage("phone number is required"),
    body("message").exists().withMessage("message is required"),
  ],
  CheckValidationSchema,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, message, mobile } = pick(req.body, [
        "name",
        "email",
        "message",
        "mobile",
      ]);
      const options = generateOptions<ContactMessageKeys>(
        // userInfo?.email,
        process.env.EMAIL_USERNAME,
        messages["contact-message"],
        {
          "{{_EMAIL_}}": email,
          "{{_NAME_}}": name,
          "{{_PHONE_}}": mobile,
          "{{_MESSAGE_}}": message,
        }
      );
      await SendEmail({ ...options, subject: "Message from => " + name });
      res.json({ message: "Email has been sent to our support successfully!" });
    } catch (error) {
      next(error);
    }
  }
);

export default rootRouter;
