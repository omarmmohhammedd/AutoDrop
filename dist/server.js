"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const ApiError_1 = __importDefault(require("./errors/ApiError"));
const session_1 = require("./features/global/session");
const socket_io_1 = require("./features/global/socket.io");
const ErrorHandler_1 = require("./middlewares/ErrorHandler");
const routes_1 = __importDefault(require("./routes"));
const salla_1 = __importDefault(require("./webhooks/salla"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 2000;
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("tiny"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
console.log(__dirname);
app.set("trust proxy", 1);
(0, session_1.SetupSession)().then((sessionMiddleware) => {
    app.use(sessionMiddleware);
    (0, socket_io_1.RunConnection)(server)(sessionMiddleware);
});
/**
 * LISTEN TO ROUTES
 * @route /api
 */
app.post("/salla/callbacks", salla_1.default);
app.get("/salla/callbacks", (req, res, next) => {
    const query = req.query;
    const params = req.params;
    const body = req.body;
    console.log("salla callbacks get route => ", {
        query,
        params,
        body,
    });
    next();
});
app.use(routes_1.default);
/**
 * LISTEN TO 404 ERROR ROUTE
 */
app.use("*", function (req, res, next) {
    // console.log("route is invalid");
    next(new ApiError_1.default("MethodNotAllowed", "Invalid route"));
    // res.status(404).send();
});
/**
 * LISTEN TO GLOBAL ERROR HANDLER
 */
app.use(ErrorHandler_1.ErrorHandler);
/**
 * RUN SERVER ON @PORT 3000 | 2000
 */
// RunConnection(server);
(0, db_1.connection)().then(() => {
    server.listen(PORT, () => {
        console.log("-- Server running or port " + PORT + " --");
        // console.log("-- Cron job started --");
        // trackingOrdersTask.start();
        // initializeTask.start();
        // checkSubscriptions.start();
        // task.start();
        // deletionTask.start();
    });
});
exports.default = app;
