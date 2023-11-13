"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const db_1 = require("./db");
const ErrorHandler_1 = require("./middlewares/ErrorHandler");
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const salla_1 = __importDefault(require("./webhooks/salla"));
const crypto_1 = __importDefault(require("crypto"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const aliexpress_1 = __importDefault(require("./cron/aliexpress"));
const session_1 = require("./features/global/session");
const socket_io_1 = require("./features/global/socket.io");
const settings_1 = __importDefault(require("./features/settings"));
const initialize_1 = __importDefault(require("./cron/aliexpress/initialize"));
const orders_1 = require("./cron/aliexpress/orders");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)(session_1.corsConfig));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("tiny"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
app.set("trust proxy", 1);
(0, session_1.SetupSession)().then((sessionMiddleware) => {
    app.use(sessionMiddleware);
    (0, socket_io_1.RunConnection)(server)(sessionMiddleware);
});
/**
 * LISTEN TO ROUTES
 * @route /api
 */
app.post("/webhooks/subscribe", async (req, res) => {
    const requestHMAC = req.header("x-salla-signature");
    const secret = await (0, settings_1.default)("SALLA_WEBHOOK_TOKEN");
    const computedHMAC = crypto_1.default
        .createHmac("sha256", secret)
        .update(JSON.stringify(req.body))
        .digest("hex");
    // console.log(requestHMAC, computedHMAC);
    const signatureMatches = requestHMAC === computedHMAC;
    if (!signatureMatches) {
        res.sendStatus(401);
    }
    // do stuff
    res.sendStatus(200);
});
app.post("/salla/callbacks", salla_1.default);
app.post('/', salla_1.default);
app.get('/', (req, res) => res.send("App Running"));
app.use("/", routes_1.default);
/**
 * LISTEN TO 404 ERROR ROUTE
 */
app.use("*", function (req, res) {
    // res.status(404).json({ message: "Method not allowed :/" });
    // next(new ApiError("NotFound"));
    res.status(404).end();
});
/**
 * LISTEN TO GLOBAL ERROR HANDLER
 */
app.use(ErrorHandler_1.ErrorHandler);
/**
 * RUN SERVER ON @PORT 3000 | 2000
 */
(() => {
    console.log("server starting..");
    console.log("database connection starting..");
    (0, db_1.connection)().then(async () => {
        aliexpress_1.default.start();
        // deletionTask.start();
        initialize_1.default.start();
        orders_1.updateOrderStatus.start();
        server.listen(PORT || 3000, async () => {
            console.log("server is running via port:", PORT);
            console.log("database connection running.");
        });
    });
})();
exports.default = app;
