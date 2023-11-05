import GenerateMessage from "../../responses/messages/controller";
import { SendMailOptions } from "nodemailer";

export default function generateOptions<T extends string>(
  emails: string,
  template: string,
  keys: Record<T, any>
): SendMailOptions {
  const message: string = GenerateMessage(template, keys);

  const options: SendMailOptions = {
    to: emails,
    subject: "",
    html: message,
  };

  return options;
}
