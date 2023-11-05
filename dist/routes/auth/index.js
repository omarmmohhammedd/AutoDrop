"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController = __importStar(require("../../controllers/auth/index"));
const CheckValidationSchema_1 = require("../../middlewares/CheckValidationSchema");
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const auth_1 = require("../../validations/auth");
const authRouter = (0, express_1.Router)();
// authRouter.get("/verify-token", AuthController.VerifySentToken);
authRouter.get("/verify", AuthController.VerifyOTP);
authRouter.get("/profile", (0, authentication_1.default)(), AuthController.GetProfile);
authRouter.post("/login", [...auth_1.CheckLogin, CheckValidationSchema_1.CheckValidationSchema], AuthController.Login);
authRouter.post("/forgot-password", [...auth_1.CheckEmailToResetPassword, CheckValidationSchema_1.CheckValidationSchema], AuthController.SendOTP);
authRouter.post("/change-password", [...auth_1.ChangePassword, CheckValidationSchema_1.CheckValidationSchema], AuthController.ChangePassword);
authRouter.post("/update-profile", (0, authentication_1.default)(), [...auth_1.UpdateProfile, CheckValidationSchema_1.CheckValidationSchema], AuthController.UpdateProfile);
authRouter.post("/users/add", (0, authentication_1.default)(), [...auth_1.CreateUser, CheckValidationSchema_1.CheckValidationSchema], AuthController.CreateNewUser);
authRouter.post("/users/update", (0, authentication_1.default)(), [...auth_1.UpdateUser, CheckValidationSchema_1.CheckValidationSchema], AuthController.UpdateUser);
authRouter.post("/users/delete", (0, authentication_1.default)(), [...auth_1.DeleteProfile, CheckValidationSchema_1.CheckValidationSchema], AuthController.DeleteProfile);
authRouter.post("/delete", (0, authentication_1.default)(), [...auth_1.DeleteProfile, CheckValidationSchema_1.CheckValidationSchema], AuthController.DeleteProfile);
authRouter.get("/users", (0, authentication_1.default)(), AuthController.GetAllUsers);
exports.default = authRouter;
