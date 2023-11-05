import { NextFunction } from "express";
import { Server } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { corsConfig } from "./session";
import { User } from "../../models/user.model";

function RunConnection(server: Server) {
  const io = new SocketServer(server, {
    cors: corsConfig,
    transports: ["polling", "websocket"],
  });
  const namespace = io.of("/alerts");

  return (middleware: any) => {
    namespace.use(wrapper(middleware));
    namespace.use(authorizer);

    namespace.on("connection", async function (socket: Socket) {
      console.log("socket connection\n", socket.id);
      global.socket = socket;
      global.ns = namespace;

      const accounts = await User.find().exec();
      if (accounts && accounts?.length) {
        // socket.join(ac)
        for await (const account of accounts) {
          socket.join(account.id);
          console.log(
            "account => " + account.id + " has been join to it room."
          );
        }
      }

      socket.on("join", function (user) {
        console.log("user has been joined\n", user);
        socket.join(user);
      });
    });
  };
}

const wrapper = (expressMiddleware: any): any => {
  return (socket: Socket, next: () => any) =>
    expressMiddleware(socket.request, {}, next);
};

const authorizer = (socket: Socket, next: (err?: any) => any): any => {
  const request = socket.request as any;

  if (!(request?.local && request?.local?.user_id)) {
    return next(new Error("unauthorized"));
  }
  next();
};

export { RunConnection };
