"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunConnection = void 0;
const socket_io_1 = require("socket.io");
const session_1 = require("./session");
const user_model_1 = require("../../models/user.model");
function RunConnection(server) {
    const io = new socket_io_1.Server(server, {
        cors: session_1.corsConfig,
        transports: ["polling", "websocket"],
    });
    const namespace = io.of("/alerts");
    return (middleware) => {
        namespace.use(wrapper(middleware));
        namespace.use(authorizer);
        namespace.on("connection", async function (socket) {
            console.log("socket connection\n", socket.id);
            global.socket = socket;
            global.ns = namespace;
            const accounts = await user_model_1.User.find().exec();
            if (accounts && accounts?.length) {
                // socket.join(ac)
                for await (const account of accounts) {
                    socket.join(account.id);
                    console.log("account => " + account.id + " has been join to it room.");
                }
            }
            socket.on("join", function (user) {
                console.log("user has been joined\n", user);
                socket.join(user);
            });
        });
    };
}
exports.RunConnection = RunConnection;
const wrapper = (expressMiddleware) => {
    return (socket, next) => expressMiddleware(socket.request, {}, next);
};
const authorizer = (socket, next) => {
    const request = socket.request;
    if (!(request?.local && request?.local?.user_id)) {
        return next(new Error("unauthorized"));
    }
    next();
};
