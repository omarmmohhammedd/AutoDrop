"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = exports.SetupSession = void 0;
const express_session_1 = __importDefault(require("express-session"));
const uuid_1 = require("uuid");
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const db_1 = require("../../db");
async function SetupSession() {
    try {
        const mongoClient = connect_mongo_1.default.create({
            mongoUrl: db_1.DB_URL,
        });
        const sessionMiddleware = (0, express_session_1.default)({
            store: mongoClient,
            resave: false,
            saveUninitialized: false,
            secret: process.env.SESSION_KEYWORD,
            cookie: {
                secure: "auto",
                httpOnly: true,
                // maxAge: 1000 * 60 * 60 * 24 * 7
            },
            genid: () => (0, uuid_1.v4)(),
        });
        return sessionMiddleware;
    }
    catch (error) {
        console.log(error);
        console.log("error while setup session with store");
    }
}
exports.SetupSession = SetupSession;
const whitelist = ["https://autodrop.me", "http://autodrop.me"];
const corsConfig = {
    // origin: (origin, callback) => {
    //   const regex = new RegExp("(" + whitelist.join("|") + ")", "gi");
    //   const isIncluded = regex.test(origin);
    //   if (!isIncluded)
    //     return callback(
    //       new ApiError("Forbidden", "You can not use this api inside your site!")
    //     );
    //   callback(null, true);
    // },
    origin: true,
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
};
exports.corsConfig = corsConfig;
