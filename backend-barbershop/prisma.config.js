import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";

// Ensure .env is loaded when Prisma CLI evaluates this config
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
