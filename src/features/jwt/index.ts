import { sign, verify } from "jsonwebtoken";

const key = process.env.JWT_SECRET as string;

export function GenerateToken(data: any): string | undefined {
  let result: string | undefined;

  result = sign(data, key, { expiresIn: "1d" });

  return result;
}

export function VerifyToken(token: any): any {
  return new Promise((resolve, reject) => {
    let result: any;
    let expired: boolean = false;

    result = verify(token, key);

    if (!result) return reject("There is not result found!");

    expired = new Date().getTime() > new Date(result.exp * 1000).getTime();

    if (expired) return reject("Expired");
    resolve(result);
  });
}
