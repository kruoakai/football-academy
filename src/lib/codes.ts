import { randomBytes } from "crypto";

export function generateStudentCode(): string {
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `YP-${suffix}`;
}
