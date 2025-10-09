import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "jwt-secret";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: number } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
};

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const requireAuth = async (
  request: NextRequest
): Promise<{ userId: number }> => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization header required");
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    throw new Error("Invalid token");
  }

  return decoded;
};
