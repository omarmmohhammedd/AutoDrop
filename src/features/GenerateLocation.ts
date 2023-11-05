import { Request } from "express";

export default function GenerateLocation(req: Request): string {
  const protocol = req.protocol;
  const host = req.header("host");

  const location = protocol + "://" + host;
  return location;
}
