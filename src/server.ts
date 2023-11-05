import { config } from "dotenv";
config();

import { createServer } from "http";
import express, { Application, Request, Response, NextFunction } from "express";
import { connection } from "./db";
import Authentication from "./middlewares/authentication";
import { ErrorHandler } from "./middlewares/ErrorHandler";
import morgan from "morgan";
import helmet from "helmet";
import AppWebHook from "./webhooks/salla";
import crypto from "crypto";
import bodyParser from "body-parser";
import router from "./routes";
import ApiError from "./errors/ApiError";
import cors from "cors";
import path from "path";
import task from "./cron/aliexpress";
import { SetupSession, corsConfig } from "./features/global/session";
import { RunConnection } from "./features/global/socket.io";
import deletionTask from "./cron/temporaryDeletion";
import findSettingKey from "./features/settings";
import axios from "axios";
import { updateToken } from "./features/aliExpress/features/initialize";
import initializeTask from "./cron/aliexpress/initialize";
import MakeRequest from "./features/aliExpress/request";
import { updateOrderStatus } from "./cron/aliexpress/orders";

const app: Application = express();
const server = createServer(app);
const PORT = process.env.PORT || 2000;

app.use(cors(corsConfig));
app.use(helmet());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "..", "public")));


app.set("trust proxy", 1);
SetupSession().then((sessionMiddleware) => {
  app.use(sessionMiddleware);
  RunConnection(server)(sessionMiddleware);
});

/**
 * LISTEN TO ROUTES
 * @route /api
 */

app.post("/webhooks/subscribe", async (req, res) => {
  const requestHMAC = req.header("x-salla-signature");
  const secret = await findSettingKey("SALLA_WEBHOOK_TOKEN");
  const computedHMAC = crypto
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

app.post("/salla/callbacks", AppWebHook);

app.post('/',AppWebHook)

app.get('/',(req,res)=>res.send("App Running"))


           
app.use("/", router);

/**
 * LISTEN TO 404 ERROR ROUTE
 */
app.use("*", function (req: Request, res: Response) {
  // res.status(404).json({ message: "Method not allowed :/" });
  // next(new ApiError("NotFound"));
  res.status(404).end();
});

/**
 * LISTEN TO GLOBAL ERROR HANDLER
 */
app.use(ErrorHandler);

/**
 * RUN SERVER ON @PORT 3000 | 2000
 */


(() => {
  console.log("server starting..");
  console.log("database connection starting..");
  connection().then(async () => {
    task.start();
    deletionTask.start();
    initializeTask.start();
    updateOrderStatus.start()
    server.listen(PORT, async() => {
      console.log("server is running via port:", PORT);
      console.log("database connection running.");
    });
 
  });
})();

export default app;
