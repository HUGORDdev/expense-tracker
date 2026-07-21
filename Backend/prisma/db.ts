// import { PrismaClient } from "./generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || "" });
export const prisma = new PrismaClient({ adapter });