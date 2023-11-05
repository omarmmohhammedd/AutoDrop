import { Router } from "express";
import * as AuthController from "../../controllers/auth/index";
import Authentication from "../../middlewares/authentication";
import {
  ChangePassword,
  CheckEmailToResetPassword,
  CheckLogin,
  CreateUser,
  DeleteProfile,
  UpdateProfile,
  UpdateUser,
} from "../../validations/auth";
import { CheckValidationSchema } from "../../middlewares/CheckValidationSchema";

const authRouter: Router = Router();

authRouter.get("/verify-token", AuthController.VerifySentToken);
authRouter.get("/verify", AuthController.VerifyOTP);

authRouter.get("/profile", Authentication(), AuthController.GetProfile);

authRouter.post(
  "/login",
  [...CheckLogin, CheckValidationSchema],
  AuthController.Login
);

authRouter.post(
  "/forgot-password",
  [...CheckEmailToResetPassword, CheckValidationSchema],
  AuthController.SendOTP
);

authRouter.post(
  "/change-password",
  [...ChangePassword, CheckValidationSchema],
  AuthController.ChangePassword
);

authRouter.post(
  "/update-profile",
  Authentication(),
  [...UpdateProfile, CheckValidationSchema],
  AuthController.UpdateProfile
);

authRouter.post(
  "/users/add",
  Authentication(),
  [...CreateUser, CheckValidationSchema],
  AuthController.CreateNewUser
);

authRouter.post(
  "/users/update",
  Authentication(),
  [...UpdateUser, CheckValidationSchema],
  AuthController.UpdateUser
);

authRouter.post(
  "/users/delete",
  Authentication(),
  [...DeleteProfile, CheckValidationSchema],
  AuthController.DeleteProfile
);

authRouter.post(
  "/delete",
  Authentication(),
  [...DeleteProfile, CheckValidationSchema],
  AuthController.DeleteProfile
);

authRouter.get("/users", Authentication(), AuthController.GetAllUsers);

export default authRouter;
