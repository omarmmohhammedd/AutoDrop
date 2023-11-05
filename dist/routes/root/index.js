"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const root_1 = require("../../controllers/root");
const lodash_1 = require("lodash");
const generateOptions_1 = __importDefault(require("../../features/email/generateOptions"));
const messages_1 = require("../../responses/messages");
const send_1 = __importDefault(require("../../features/email/send"));
const CheckValidationSchema_1 = require("../../middlewares/CheckValidationSchema");
const express_validator_1 = require("express-validator");
const rootRouter = (0, express_1.Router)();
rootRouter.get("/dashboard", (0, authentication_1.default)(), root_1.GetDashboard);
rootRouter.get("/settings", root_1.GetStaticSettings);
rootRouter.get("/settings/keys", root_1.GetServerKeys);
rootRouter.get('/settings/token', root_1.urlToken);
rootRouter.post("/settings/keys/update", root_1.UpdateServerKeys);
rootRouter.post("/contact", ...[
    (0, express_validator_1.body)("name").exists().withMessage("Name is required"),
    (0, express_validator_1.body)("email")
        .exists()
        .withMessage("email is required")
        .isEmail()
        .withMessage("Invalid email address"),
    (0, express_validator_1.body)("mobile").exists().withMessage("phone number is required"),
    (0, express_validator_1.body)("message").exists().withMessage("message is required"),
], CheckValidationSchema_1.CheckValidationSchema, async (req, res, next) => {
    try {
        const { name, email, message, mobile } = (0, lodash_1.pick)(req.body, [
            "name",
            "email",
            "message",
            "mobile",
        ]);
        const options = (0, generateOptions_1.default)(
        // userInfo?.email,
        process.env.EMAIL_USERNAME, messages_1.messages["contact-message"], {
            "{{_EMAIL_}}": email,
            "{{_NAME_}}": name,
            "{{_PHONE_}}": mobile,
            "{{_MESSAGE_}}": message,
        });
        await (0, send_1.default)({ ...options, subject: "Message from => " + name });
        res.json({ message: "Email has been sent to our support successfully!" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = rootRouter;
