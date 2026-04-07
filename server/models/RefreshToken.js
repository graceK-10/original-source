// server/models/RefreshToken.js
// Replace with your ORM (Prisma, Mongoose, Sequelize, etc.)
import crypto from "crypto";

const mem = new Map(); // DEMO ONLY. Replace with DB.

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function saveRefreshToken(userId, rawToken, expiresAt) {
  const key = `${userId}:${hashToken(rawToken)}`;
  mem.set(key, { userId, expiresAt, revokedAt: null });
}

export async function findRefreshToken(userId, rawToken) {
  const key = `${userId}:${hashToken(rawToken)}`;
  return mem.get(key);
}

export async function revokeRefreshToken(userId, rawToken) {
  const key = `${userId}:${hashToken(rawToken)}`;
  const row = mem.get(key);
  if (row) row.revokedAt = new Date();
  mem.set(key, row);
}

export function isValidRefreshRow(row) {
  if (!row) return false;
  if (row.revokedAt) return false;
  if (row.expiresAt && new Date(row.expiresAt) < new Date()) return false;
  return true;
}
