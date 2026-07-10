import { Prisma } from "@/generated/prisma/client";

/** True when a delete/update failed because other rows still reference it (FK constraint). */
export function isForeignKeyError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2003" || error.code === "P2014")
  );
}

/** True when a unique constraint (e.g. duplicate code/email) was violated. */
export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
