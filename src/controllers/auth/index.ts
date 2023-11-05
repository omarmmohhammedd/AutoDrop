import { User } from "../../models/user.model";
import { GenerateToken, VerifyToken } from "../../features/jwt";
import { NextFunction, Request, Response } from "express";
import { pick } from "lodash";
import ApiError from "../../errors/ApiError";
import { CompareHash, HashPassword } from "../../features/generator";
import { Subscription } from "../../models/subscription.model";
import generateOptions from "../../features/email/generateOptions";
import {
  DeleteAccountKeys,
  ResetPassword,
  messages,
} from "../../responses/messages";
import SendEmail from "../../features/email/send";
import ModelFactor from "../../features/ModelsFactor";
import { OTP } from "../../models/otp.model";
import { isValidObjectId } from "mongoose";
import { Plan } from "../../models/plan.model";
import moment from "moment";

export async function VerifySentToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { access_token } = pick(req.query, ["access_token"]);

    if (!access_token) return res.end();

    const matched = await VerifyToken(access_token);

    if (!matched) return res.end();
    const { token } = matched;

    res.json({
      message: "success",
      token: JSON.parse(token)?.access_token,
    });
  } catch (error) {
    next(error);
  }
}

export async function Login(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;
    const { email } = pick(req.body, ["email"]);
    const account = await User.findOne({ email }).exec();

    if (!account) throw new ApiError("NotFound");

    token = GenerateToken({
      ...(account?.userType === "vendor"
        ? { merchant: account?.merchantId, token: account?.tokens }
        : {}),
      userType: account?.userType,
      userId: account?.id,
    });

    // update deleted date to null every time
    account.deletedAt = null;

    // check if current user has subscription or not to set default plan.
    if (account.userType === "vendor") {
      const subscription = await Subscription.findOne({
        user: account.id,
      }).exec();

      if (!subscription) {
        const plan = await Plan.findOne({ is_default: true }).exec();

        if (plan) {
          const currentDate = moment().toDate();
          const nextPayment = moment().add(7, "days").toDate();

          await Subscription.create({
            plan: plan?.id,
            orders_limit: plan?.orders_limit,
            products_limit: plan?.products_limit,
            start_date: currentDate,
            expiry_date: nextPayment,
            user: account.id,
          });
        }
      }
    }

    await account.save();
    res.json({
      access_token: token,
    });
  } catch (error) {
    next(error);
  }
}

export async function SendOTP(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;
    const { email, redirect } = pick(req.body, ["email", "redirect"]);
    const account = await User.findOne({ email }).exec();
    if (!account) throw new ApiError("NotFound");

    const OTPValue = GenerateOTP();
    const value = HashPassword(OTPValue);
    const otp = await OTP.create({ value, user: account.id });

    token = GenerateToken({
      email,
      value: OTPValue,
      hash: otp.id,
    });

    const options = generateOptions<ResetPassword>(
      // userInfo?.email,
      "frontdev0219@gmail.com",
      messages["reset-password"],
      {
        "{{_NAME_}}": account?.name,
        "{{_REDIRECT_}}": redirect + "?otp=" + token,
      }
    );

    await SendEmail(options);
    res.json({
      message:
        "Email has been sent successfully via email address you entered, visit your inbox",
    });
  } catch (error) {
    next(error);
  }
}

export async function VerifyOTP(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { otp } = pick(req.query, ["otp"]);

    if (!otp) throw new ApiError("UnprocessableEntity", "Invalid OTP");

    const matched = await VerifyToken(otp);

    if (!matched) throw new ApiError("UnprocessableEntity", "Invalid OTP");

    const { hash, email, value }: any = matched;

    if (!isValidObjectId(hash))
      throw new ApiError("UnprocessableEntity", "OTP Not found");

    const checkOTP = await OTP.findById(hash).exec();
    if (!checkOTP) throw new ApiError("UnprocessableEntity", "OTP expired!");

    const OTPMatched = CompareHash(value, checkOTP.value);

    if (!OTPMatched)
      throw new ApiError("UnprocessableEntity", "OTP not matched!");

    await checkOTP.delete();

    res.json({
      message: "OTP verified successfully, you can reset password now",
      result: {
        email,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function UpdateProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, ...data } = pick(req.body, ["email", "mobile", "name"]);

    User.findOneAndUpdate(
      {
        email,
      },
      {
        $set: {
          email,
          ...data,
        },
      },
      { new: true },
      function (err, result) {
        if (err)
          return next(
            new ApiError(
              "InternalServerError",
              "Something went wrong while updating profile info"
            )
          );
        if (!result)
          return next(
            new ApiError("InternalServerError", "There is no account available")
          );

        res.json({
          message: "Profile updated successfully",
        });
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function ChangePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let password: string | undefined;
    const { email, ...data } = pick(req.body, [
      "email",
      "new-password",
      "confirmation-password",
    ]);

    password = HashPassword(data["new-password"]);

    User.findOneAndUpdate(
      {
        email,
      },
      {
        $set: {
          password: password,
        },
      },
      { new: true },
      function (err, result) {
        if (err)
          return next(
            new ApiError(
              "InternalServerError",
              "Something went wrong while updating password info"
            )
          );
        if (!result)
          return next(
            new ApiError("InternalServerError", "There is no account available")
          );

        res.json({
          message: "Password updated successfully",
        });
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function DeleteProfile(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { userType } = pick(req.local, ["userType"]);
    const { id } = pick(req.body, ["id"]);

    console.log("userType", userType, req.local);

    if (userType === "admin") {
      const counts = await User.countDocuments({ userType: "admin" });

      if (counts === 1) {
        throw new ApiError(
          "Forbidden",
          "You cannot delete this account, try to add another one then delete it anytime you want."
        );
      }
    }

    User.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true },
      async function (err, result) {
        if (err)
          return next(
            new ApiError(
              "InternalServerError",
              "Something went wrong while deleting account info"
            )
          );

        if (!result)
          return next(
            new ApiError("InternalServerError", "There is no account available")
          );

        const options = generateOptions<DeleteAccountKeys>(
          // userInfo?.email,
          "frontdev0219@gmail.com",
          messages["delete-account"],
          {
            "{{_NAME_}}": result?.name,
          }
        );
        await SendEmail(options);
        res.json({
          message: "Account deleted successfully",
        });
      }
    );
  } catch (error) {
    next(error);
  }
}

export async function GetProfile(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { user_id } = pick(req.local, ["user_id"]);

    const account = await User.findById(user_id)
      .select(
        "name email mobile avatar userType pt_customer_id pt_default_card_id pt_card_ids"
      )
      .exec();

    if (!account) throw new ApiError("NotFound");
    const subscription = await Subscription.findOne({
      user: account.id,
    })
      .populate("plan")
      .exec();

    res.json({ account, subscription });
  } catch (error) {
    next(error);
  }
}

export async function GetAllUsers(
  req: Request & any,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, userType, search_key } = pick(req.query, [
      "page",
      "userType",
      "search_key",
    ]);
    const query = {
      ...(userType && { userType }),
    };
    const select = "name email mobile userType createdAt avatar id";

    const users = page
      ? await ModelFactor(User, { page, search_key, select }, query)
      : await User.find(query).select(select);
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function CreateNewUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let password: string | undefined;
    const { userType, ...data } = pick(req.body, [
      "name",
      "email",
      "password",
      "mobile",
      "userType",
    ]);

    password = HashPassword(data["password"]);

    const user = new User({
      ...data,
      userType: userType || "admin",
      password,
    });

    user.save(function (err, result) {
      if (err)
        return next(
          new ApiError(
            "InternalServerError",
            "Something went wrong while adding new user"
          )
        );
      res.json({ message: "User added successfully!" });
    });
  } catch (error) {
    next(error);
  }
}

export async function UpdateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id, ...data } = pick(req.body, ["name", "email", "mobile", "id"]);

    User.findByIdAndUpdate(
      id,
      { $set: { ...data } },
      { new: true },
      function (err, result) {
        if (err)
          return next(
            new ApiError(
              "InternalServerError",
              "Something went wrong while updating"
            )
          );

        if (!result) return next(new ApiError("NotFound", "Account not found"));

        res.json({ message: "Account updated successfully" });
      }
    );
  } catch (error) {
    next(error);
  }
}

function GenerateOTP() {
  return Math.floor(Math.random() * (999999 - 100000) + 10000).toString();
}
