// import { PrismaClient } from "./generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = `${Bun.env.DATABASE_URL}`
const adapter = new PrismaLibSql({ url: connectionString });
export const prisma = new PrismaClient({adapter});