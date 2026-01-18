import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Force absolute path for production - adjust this path for your VPS
const getDbUrl = () => {
  // If DATABASE_URL is set and is absolute, use it
  if (process.env.DATABASE_URL?.startsWith('file:/')) {
    return process.env.DATABASE_URL;
  }
  // Default to absolute path on VPS
  return 'file:/root/novosaasage/wavespeed-chat/prisma/dev.db';
};

const databaseUrl = getDbUrl();
console.log('Prisma connecting to:', databaseUrl);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
