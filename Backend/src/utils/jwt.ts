// src/utils/jwt.ts
// JWT token creation and verification utilities

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { config } from "../config";

// Custom payload interface extending standard JWT claims
export interface TokenPayload extends JWTPayload {
  sub: string;       // User ID (subject claim)
  email: string;     // User email for convenience
  type: "access" | "refresh";  // Token type for validation
  jti: string;       // Unique token ID for revocation
}

// Convert secret strings to Uint8Array for jose library
const accessSecret = new TextEncoder().encode(config.jwtSecret);
const refreshSecret = new TextEncoder().encode(config.refreshSecret);

// Generate a unique token ID for tracking and revocation
function generateTokenId(): string {
  return crypto.randomUUID();
}

// Create a short-lived access token for API authentication
export async function createAccessToken(
  userId: string,
  email: string
): Promise<string> {
  const tokenId = generateTokenId();

  // Build and sign the JWT with all required claims
  const token = await new SignJWT({
    sub: userId,
    email: email,
    type: "access",
    jti: tokenId,
  })
    .setProtectedHeader({ alg: "HS256" })  // Algorithm in header
    .setIssuedAt()                          // Current timestamp
    .setExpirationTime(config.accessTokenExpiry)  // Short expiry
    .setIssuer("bun-auth-service")          // Identifies token source
    .setAudience("bun-api")                 // Intended recipient
    .sign(accessSecret);

  return token;
}

// Create a longer-lived refresh token for obtaining new access tokens
export async function createRefreshToken(
  userId: string,
  email: string
): Promise<{ token: string; tokenId: string }> {
  const tokenId = generateTokenId();

  const token = await new SignJWT({
    sub: userId,
    email: email,
    type: "refresh",
    jti: tokenId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.refreshTokenExpiry)  // Longer expiry
    .setIssuer("bun-auth-service")
    .setAudience("bun-api")
    .sign(refreshSecret);

  // Return both token and ID for database storage
  return { token, tokenId };
}

// Verify an access token and return its payload
export async function verifyAccessToken(
  token: string
): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, accessSecret, {
      issuer: "bun-auth-service",
      audience: "bun-api",
    });

    // Ensure this is an access token, not a refresh token
    if (payload.type !== "access") {
      throw new Error("Invalid token type");
    }

    return payload as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
}

// Verify a refresh token and return its payload
export async function verifyRefreshToken(
  token: string
): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret, {
      issuer: "bun-auth-service",
      audience: "bun-api",
    });

    // Ensure this is a refresh token, not an access token
    if (payload.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    return payload as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
}