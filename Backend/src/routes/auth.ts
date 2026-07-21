// src/routes/auth.ts
// Authentication endpoints for login, refresh, and logout

import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { createUser, validateCredentials } from "../utils/users";
import {
  storeRefreshToken,
  getStoredToken,
  revokeToken,
  revokeTokenFamily,
  revokeAllUserTokens,
  getUserSessions,
} from "../utils/tokenStore";
import { withAuth, type AuthenticatedRequest } from "../middleware/auth";
import type { Request, Response } from "express";
// import { createUser } from "../utils/users";

// Helper for JSON responses
// function json(data: object, status: number = 200): Response {
//   return new Response(JSON.stringify(data), {
//     status,
//     headers: { "Content-Type": "application/json" },
//   });
// }

// POST /auth/register - Create a new user account
export async function register(req: Request,res:Response): Promise<Response> {
  try {
    const { name,email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
      // return res.status(400).json({error: "Email and password required"});
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json(
        { error: "Password must be at least 8 characters" }
      );
    }

    // Create user with hashed password
    console.time("2. createUser (Hash + DB)");
    const user = await createUser(name,email, password);
    console.timeEnd("2. createUser (Hash + DB)");
     if (!user) {
      // Use generic error message to prevent user enumeration
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const accessToken = await createAccessToken(user.id, user.email);
    const { token: refreshToken, tokenId } = await createRefreshToken(
      user.id,
      user.email
    );

    // Create family ID for token rotation tracking
    const familyId = crypto.randomUUID();

    // Store refresh token metadata
    const deviceInfo = req.headers["user-agent"] || "Unknown";
    storeRefreshToken(tokenId, user.id, familyId, deviceInfo);
    return res.status(201).json({
      message: "User created successfully",
      accessToken,
      user: {
        id: user.id,
        name: user.userName,
        email: user.email,
      },
    });
    // user.
  } catch (error) {
    console.error("Erreur durant le register :", error);
    if (error instanceof Error && error.message === "User already exists") {
      return res.status(409).json({ error: "Email already registered" });
    }
    return res.status(500).json({ error: "Registration failed" });
  }
}

// POST /auth/login - Authenticate and receive tokens
export async function login(req: Request,res:Response): Promise<Response> {
  try {
    // const body = await req.body();
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Validate credentials
    const user = await validateCredentials(email, password);

    if (!user) {
      // Use generic error message to prevent user enumeration
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token pair
    const accessToken = await createAccessToken(user.id, user.email);
    const { token: refreshToken, tokenId } = await createRefreshToken(
      user.id,
      user.email
    );

    // Create family ID for token rotation tracking
    const familyId = crypto.randomUUID();

    // Store refresh token metadata
    const deviceInfo = req.headers["user-agent"] || "Unknown";
    storeRefreshToken(tokenId, user.id, familyId, deviceInfo);

    return res.json({
      accessToken,
      // refreshToken,
      // tokenType: "Bearer",
      // expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        name: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
}

// POST /auth/refresh - Exchange refresh token for new token pair
export async function refresh(req: Request, res:Response): Promise<Response> {
  try {
    // const body = await req.body();
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    // Verify the refresh token signature and claims
    const payload = await verifyRefreshToken(refreshToken);

    // Get stored token metadata
    const storedToken = getStoredToken(payload.jti as string);

    if (!storedToken) {
      return res.status(401).json({ error: "Refresh token not found" });
    }

    // Check if token was revoked (already used or explicitly revoked)
    if (storedToken.revoked) {
      // SECURITY: Token reuse detected - possible theft!
      // Revoke entire token family to force re-authentication
      revokeTokenFamily(storedToken.familyId);
      return res.status(401).json(
        { error: "Token reuse detected. All sessions revoked." });
    }

    // Mark old token as used (revoked)
    revokeToken(payload.jti as string);

    // Generate new token pair
    const newAccessToken = await createAccessToken(
      payload.sub as string,
      payload.email as string
    );
    const { token: newRefreshToken, tokenId: newTokenId } =
      await createRefreshToken(
        payload.sub as string,
        payload.email as string
      );

    // Store new refresh token in same family
    storeRefreshToken(
      newTokenId,
      payload.sub as string,
      storedToken.familyId,
      storedToken.deviceInfo
    );

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: "Bearer",
      expiresIn: 900,
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
}

// POST /auth/logout - Revoke current refresh token
export const logout = withAuth(
  async (req: AuthenticatedRequest,res:Response) => {
    try {
      // const body =  
      const { refreshToken } = req.body ;

      if (refreshToken) {
        // Verify and revoke the provided refresh token
        const payload = await verifyRefreshToken(refreshToken);
        revokeToken(payload.jti as string);
      }

      return res.json({ message: "Logged out successfully" });
    } catch (error) {
      // Even if token validation fails, consider logout successful
      return res.json({ message: "Logged out" });
    }
  }
);

// POST /auth/logout-all - Revoke all user sessions
export const logoutAll = withAuth(
  async (req: AuthenticatedRequest,res:Response)=> {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    revokeAllUserTokens(req.user.sub);

    return res.json({ message: "All sessions logged out" });
  }
);

// GET /auth/sessions - Get all active sessions for current user
export const sessions = withAuth(
  async (req: AuthenticatedRequest,res:Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userSessions = getUserSessions(req.user.sub);

    // Return sanitized session info (don't expose token IDs)
    const sessionInfo = userSessions.map((s) => ({
      deviceInfo: s.deviceInfo,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));

    return res.json({ sessions: sessionInfo });
  }
);