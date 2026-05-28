import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Fallback to postgresql if invalid or empty to prevent startup crash
const rawUrl = process.env.DATABASE_URL;
if (!rawUrl || (!rawUrl.startsWith('postgresql://') && !rawUrl.startsWith('postgres://'))) {
  console.warn("[PrismaInit] DATABASE_URL is missing or invalid. Implementing Postgres placeholder to bypass startup crash.");
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/outrent?schema=public";
}

const prisma = new PrismaClient();
export default prisma;
