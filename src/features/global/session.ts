import session from "express-session";
import { v4 as generateID } from "uuid";
import MongoStore from "connect-mongo";
import { DB_URL } from "../../db";
import ApiError from "../../errors/ApiError";

async function SetupSession(): Promise<any> {
  try {
    const mongoClient = MongoStore.create({
      mongoUrl: DB_URL,
    });

    const sessionMiddleware = session({
      store: mongoClient,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: process.env.SESSION_KEYWORD as string,
      cookie: {
        secure: "auto",
        httpOnly: true,
        // maxAge: 1000 * 60 * 60 * 24 * 7
      },
      genid: () => generateID(),
    });

    return sessionMiddleware;
  } catch (error) {
    console.log(error);
    console.log("error while setup session with store");
  }
}

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

export { SetupSession, corsConfig };
