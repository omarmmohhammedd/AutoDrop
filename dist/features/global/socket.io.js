"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNamespaceRoomMessage = exports.RunConnection = void 0;
const socket_io_1 = require("socket.io");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const user_model_1 = require("../../models/user.model");
const jwt_1 = require("../jwt");
const session_1 = require("./session");
function RunConnection(server) {
    const io = new socket_io_1.Server(server, {
        cors: session_1.corsConfig,
        transports: ["polling", "websocket"],
    });
    const namespace = io.of("/alerts");
    return (middleware) => {
        namespace.use(wrapper(middleware));
        namespace.use(authorizer);
        global.ns = namespace;
        namespace.on("connection", async function (socket) {
            global.socket = socket;
            socket.on("join", function (user) {
                socket.join(user);
            });
        });
    };
}
exports.RunConnection = RunConnection;
const wrapper = (expressMiddleware) => {
    return (socket, next) => expressMiddleware(socket.request, {}, next);
};
const authorizer = async (socket, next) => {
    try {
        const auth = socket.handshake.auth;
        const { user, authorization } = auth;
        const existedUser = await user_model_1.User.findById(user).exec();
        const decodeToken = await (0, jwt_1.VerifyToken)(authorization).catch(() => next(new ApiError_1.default("Unauthorized", "JWT expired, re-login")));
        if (!existedUser) {
            throw new ApiError_1.default("UnprocessableEntity", "Account not found");
        }
        if (!decodeToken)
            throw new ApiError_1.default("Unauthorized", "unauthorized");
        next();
    }
    catch (error) {
        next(error);
    }
};
const sendNamespaceRoomMessage = (room, data) => global.ns.to(room).emit(data);
exports.sendNamespaceRoomMessage = sendNamespaceRoomMessage;
