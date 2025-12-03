import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { Pool } from "pg";

// Ensure environment variables are loaded before reading DATABASE_URL
dotenv.config();

const rawUrl = process.env.DATABASE_URL;
const connectionString =
  typeof rawUrl === "string" ? rawUrl.replace(/^"|"$/g, "") : undefined;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set or is not a string.");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
