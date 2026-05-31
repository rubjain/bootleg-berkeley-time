import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | undefined;
let prismaInitError: Error | undefined;

try {
  prismaInstance =
    global.prismaGlobal ??
    new PrismaClient({
      log: ["error"]
    });

  if (process.env.NODE_ENV !== "production") {
    global.prismaGlobal = prismaInstance;
  }
} catch (error) {
  prismaInstance = undefined;
  prismaInitError = error instanceof Error ? error : new Error("Failed to initialize Prisma client");
}

export function isPrismaAvailable() {
  return prismaInstance !== undefined;
}

export function getPrismaInitError() {
  return prismaInitError;
}

export const prisma =
  prismaInstance ??
  new Proxy({} as PrismaClient, {
    get() {
      throw prismaInitError ?? new Error("Prisma client unavailable. Run npm run prisma:generate and configure DATABASE_URL.");
    }
  });
