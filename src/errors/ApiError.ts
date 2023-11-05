import { NamedConstructors } from "http-errors";

export default class ApiError extends Error {
  code: keyof NamedConstructors;
  constructor(code: keyof NamedConstructors, message?: string | any) {
    super(message);
    this.message = message;
    this.code = code;
  }
}
