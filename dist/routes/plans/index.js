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
const PLanController = __importStar(require("../../controllers/plans"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const plans_1 = require("../../validations/plans");
const CheckValidationSchema_1 = require("../../middlewares/CheckValidationSchema");
const plansRouter = (0, express_1.Router)();
plansRouter.post("/add", (0, authentication_1.default)("admin"), [...plans_1.CreatePlan, CheckValidationSchema_1.CheckValidationSchema], PLanController.CreatePlan);
plansRouter.post("/update", (0, authentication_1.default)("admin"), [...plans_1.UpdatePlan, CheckValidationSchema_1.CheckValidationSchema], PLanController.UpdatePlan);
plansRouter.post("/subscribe", (0, authentication_1.default)(), PLanController.CreatePaymentToSubscribe);
plansRouter.post("/resubscribe", (0, authentication_1.default)(), PLanController.CreatePaymentToSubscribe);
plansRouter.post("/delete/:id", (0, authentication_1.default)("admin"), PLanController.DeletePlan);
plansRouter.post("/transactions/:user", (0, authentication_1.default)("admin"), PLanController.GetPlanAndVendorTransactions);
plansRouter.get("/subscriptions", (0, authentication_1.default)("admin"), PLanController.GetAllSubscriptions);
plansRouter.get("/", PLanController.GetAllPlans);
plansRouter.get("/:id", (0, authentication_1.default)("admin"), PLanController.GetSelectedPlan);
exports.default = plansRouter;
