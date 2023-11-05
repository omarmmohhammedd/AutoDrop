import { compareSync, genSaltSync, hashSync } from "bcrypt";
import { generate } from "otp-generator";

export function GenerateRandom(length: number | 6): string {
  return generate(length, {
    lowerCaseAlphabets: false,
    digits: false,
    upperCaseAlphabets: true,
    specialChars: false,
  });
}

export function HashPassword(password: string): string {
  const salt = genSaltSync(16);
  const hash = hashSync(password, salt);

  return hash;
}

export function CompareHash(password: string, hashed: string): boolean {
  const salt = genSaltSync(16);
  const matched = compareSync(password, hashed);
  return matched;
}
