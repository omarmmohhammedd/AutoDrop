import { isValidObjectId } from "mongoose";
import { CompareHash } from "../../features/generator";
import { User } from "../../models/user.model";
import { Request } from "express";
import { ValidationChain, body } from "express-validator";
import { compareSync } from "bcrypt";

const CheckLogin = [
  body("email")
    .exists()
    .withMessage("email address is required")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (value: string, { req }: any) => {
      if (!value) return false;
      const account = await User.findOne({ email: value }).exec();
      if (!account) throw Error("Account not found");
      return false;
    }),
  body("password")
    .exists()
    .withMessage("Password is required")
    .custom(async (value: string, { req }: any) => {
      if (!req.body.email) return false;
      const account = await User.findOne({ email: req.body.email }).exec();

      if (!account) return false;
      const passwordMatched = compareSync(value, account.password);

      if (!passwordMatched) throw Error("Invalid password");

      return false;
    }),
] satisfies ValidationChain[];

const CheckEmailToResetPassword = [
  body("email")
    .exists()
    .withMessage("email address is required")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (value: string, { req }: any) => {
      if (!value) return false;
      const account = await User.findOne({ email: value }).exec();
      if (!account) throw Error("Account not found");
      return false;
    }),
  body("redirect").exists().withMessage("redirect URL is required"),
  // .isURL({ protocols: ["http", "https"] })
  // .withMessage("Invalid URL"),
] satisfies ValidationChain[];

const ChangePassword = [
  body("email")
    .exists()
    .withMessage("email address is required")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (value: string, { req }: any) => {
      if (!value) return false;
      const account = await User.findOne({ email: value }).exec();
      if (!account) throw Error("Account not found");
      return false;
    }),
  body("new-password")
    .exists()
    .withMessage("Password is required")
    .custom(async (value: string, { req }: any) => {
      if (!value || !req.body.email) return false;
      const account = await User.findOne({ email: req.body.email }).exec();

      if (!account) return false;
      return false;
    }),
  body("confirmation-password")
    .exists()
    .withMessage("Confirmation Password is required")
    .custom(async (value: string, { req }: any) => {
      if (value !== req.body["new-password"]) {
        throw new Error("Confirmation password is incorrect");
      }
      return false;
    }),
] satisfies ValidationChain[];

const UpdateProfile = [
  body("name").exists().withMessage("Name is required"),
  body("mobile")
    .exists()
    .withMessage("MObile is required")
    .isMobilePhone("ar-SA")
    .withMessage("Invalid phone number")
    .custom(async (value: string, { req }: any) => {
      if (!value) return false;
      const account = await User.findOne({ mobile: value }).exec();
      if (!account) throw Error("Account not found");
      return false;
    }),
  body("mobile")
    .exists()
    .withMessage("MObile is required")
    .isMobilePhone("ar-SA")
    .withMessage("Invalid phone number")
    .custom(async (value: string, { req }: any) => {
      if (!value) return false;
      const account = await User.findOne({ mobile: value }).exec();
      if (!account) throw Error("Account not found");
      return false;
    }),
] satisfies ValidationChain[];

const DeleteProfile = [
  body("id")
    .exists()
    .custom(async (value: string, { req }: any) => {
      if (!value) return false;
      const account = await User.findById(value).exec();
      if (!account) throw Error("Account not found");
      return false;
    }),
] satisfies ValidationChain[];

const UpdateUser = [
  ...UpdateProfile,
  body("id")
    .exists()
    .withMessage("id is required")
    .isMongoId()
    .withMessage("Invalid id")
    .custom(async (value: string) => {
      if (!value) return;
      if (!isValidObjectId(value)) return;
      const acc = await User.findById(value).exec();
      if (!acc) throw new Error("account not found");
      return false;
    }),
] satisfies ValidationChain[];

const CreateUser = [
  body("name").exists().withMessage("Name is required"),
  body("password")
    .exists()
    .withMessage("password is required")
    .isLength({ min: 8, max: 255 })
    .withMessage("Password letters should be between 8 and 255 letter"),
  body("mobile")
    .exists()
    .withMessage("MObile is required")
    .isMobilePhone("ar-SA")
    .withMessage("Invalid phone number")
    .custom(async (value: string, { req }: any) => {
      if (!value) return false;
      const account = await User.findOne({ mobile: value }).exec();
      if (account) throw Error("Account in use");
      return false;
    }),
  body("mobile")
    .exists()
    .withMessage("Mobile is required")
    .isMobilePhone("ar-SA")
    .withMessage("Invalid phone number")
    .custom(async (value: string, { req }: any) => {
      if (!value) return false;
      const account = await User.findOne({ mobile: value }).exec();
      if (account) throw Error("Account in use");
      return false;
    }),
] satisfies ValidationChain[];

export {
  CheckLogin,
  ChangePassword,
  UpdateProfile,
  DeleteProfile,
  UpdateUser,
  CreateUser,
  CheckEmailToResetPassword,
};
