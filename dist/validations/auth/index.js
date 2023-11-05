"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckEmailToResetPassword = exports.CreateUser = exports.UpdateUser = exports.DeleteProfile = exports.UpdateProfile = exports.ChangePassword = exports.CheckLogin = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("../../models/user.model");
const express_validator_1 = require("express-validator");
const bcrypt_1 = require("bcrypt");
const CheckLogin = [
    (0, express_validator_1.body)("email")
        .exists()
        .withMessage("email address is required")
        .isEmail()
        .withMessage("Invalid email")
        .custom(async (value, { req }) => {
        if (!value)
            return false;
        const account = await user_model_1.User.findOne({ email: value }).exec();
        if (!account)
            throw Error("Account not found");
        return false;
    }),
    (0, express_validator_1.body)("password")
        .exists()
        .withMessage("Password is required")
        .custom(async (value, { req }) => {
        if (!req.body.email)
            return false;
        const account = await user_model_1.User.findOne({ email: req.body.email }).exec();
        if (!account)
            return false;
        const passwordMatched = (0, bcrypt_1.compareSync)(value, account.password);
        if (!passwordMatched)
            throw Error("Invalid password");
        return false;
    }),
];
exports.CheckLogin = CheckLogin;
const CheckEmailToResetPassword = [
    (0, express_validator_1.body)("email")
        .exists()
        .withMessage("email address is required")
        .isEmail()
        .withMessage("Invalid email")
        .custom(async (value, { req }) => {
        if (!value)
            return false;
        const account = await user_model_1.User.findOne({ email: value }).exec();
        if (!account)
            throw Error("Account not found");
        return false;
    }),
    (0, express_validator_1.body)("redirect").exists().withMessage("redirect URL is required"),
    // .isURL({ protocols: ["http", "https"] })
    // .withMessage("Invalid URL"),
];
exports.CheckEmailToResetPassword = CheckEmailToResetPassword;
const ChangePassword = [
    (0, express_validator_1.body)("email")
        .exists()
        .withMessage("email address is required")
        .isEmail()
        .withMessage("Invalid email")
        .custom(async (value, { req }) => {
        if (!value)
            return false;
        const account = await user_model_1.User.findOne({ email: value }).exec();
        if (!account)
            throw Error("Account not found");
        return false;
    }),
    (0, express_validator_1.body)("new-password")
        .exists()
        .withMessage("Password is required")
        .custom(async (value, { req }) => {
        if (!value || !req.body.email)
            return false;
        const account = await user_model_1.User.findOne({ email: req.body.email }).exec();
        if (!account)
            return false;
        return false;
    }),
    (0, express_validator_1.body)("confirmation-password")
        .exists()
        .withMessage("Confirmation Password is required")
        .custom(async (value, { req }) => {
        if (value !== req.body["new-password"]) {
            throw new Error("Confirmation password is incorrect");
        }
        return false;
    }),
];
exports.ChangePassword = ChangePassword;
const UpdateProfile = [
    (0, express_validator_1.body)("name").exists().withMessage("Name is required"),
    (0, express_validator_1.body)("mobile")
        .exists()
        .withMessage("MObile is required")
        .isMobilePhone("ar-SA")
        .withMessage("Invalid phone number")
        .custom(async (value, { req }) => {
        if (!value)
            return false;
        const account = await user_model_1.User.findOne({ mobile: value }).exec();
        if (!account)
            throw Error("Account not found");
        return false;
    }),
    (0, express_validator_1.body)("mobile")
        .exists()
        .withMessage("MObile is required")
        .isMobilePhone("ar-SA")
        .withMessage("Invalid phone number")
        .custom(async (value, { req }) => {
        if (!value)
            return false;
        const account = await user_model_1.User.findOne({ mobile: value }).exec();
        if (!account)
            throw Error("Account not found");
        return false;
    }),
];
exports.UpdateProfile = UpdateProfile;
const DeleteProfile = [
    (0, express_validator_1.body)("id")
        .exists()
        .custom(async (value, { req }) => {
        if (!value)
            return false;
        const account = await user_model_1.User.findById(value).exec();
        if (!account)
            throw Error("Account not found");
        return false;
    }),
];
exports.DeleteProfile = DeleteProfile;
const UpdateUser = [
    ...UpdateProfile,
    (0, express_validator_1.body)("id")
        .exists()
        .withMessage("id is required")
        .isMongoId()
        .withMessage("Invalid id")
        .custom(async (value) => {
        if (!value)
            return;
        if (!(0, mongoose_1.isValidObjectId)(value))
            return;
        const acc = await user_model_1.User.findById(value).exec();
        if (!acc)
            throw new Error("account not found");
        return false;
    }),
];
exports.UpdateUser = UpdateUser;
const CreateUser = [
    (0, express_validator_1.body)("name").exists().withMessage("Name is required"),
    (0, express_validator_1.body)("password")
        .exists()
        .withMessage("password is required")
        .isLength({ min: 8, max: 255 })
        .withMessage("Password letters should be between 8 and 255 letter"),
    (0, express_validator_1.body)("mobile")
        .exists()
        .withMessage("MObile is required")
        .isMobilePhone("ar-SA")
        .withMessage("Invalid phone number")
        .custom(async (value, { req }) => {
        if (!value)
            return false;
        const account = await user_model_1.User.findOne({ mobile: value }).exec();
        if (account)
            throw Error("Account in use");
        return false;
    }),
    (0, express_validator_1.body)("mobile")
        .exists()
        .withMessage("Mobile is required")
        .isMobilePhone("ar-SA")
        .withMessage("Invalid phone number")
        .custom(async (value, { req }) => {
        if (!value)
            return false;
        const account = await user_model_1.User.findOne({ mobile: value }).exec();
        if (account)
            throw Error("Account in use");
        return false;
    }),
];
exports.CreateUser = CreateUser;
