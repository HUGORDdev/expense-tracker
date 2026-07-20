// src/config.ts
// Application configuration loaded from environment variables

export const config = {
  // JWT secret must be at least 256 bits (32 characters) for HS256
  jwtSecret: Bun.env.JWT_SECRET,
  
  // Refresh token secret should be different from access token secret
  refreshSecret: Bun.env.REFRESH_SECRET,
  
  // Short-lived access tokens minimize damage from stolen tokens
  accessTokenExpiry: "15m",
  
  // Refresh tokens live longer but are rotated on each use
  refreshTokenExpiry: "7d",
  
  // Server port
  port: parseInt(Bun.env.PORT || "3002"),
};

// Validate required environment variables at startup
if (!config.jwtSecret || config.jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters");
}

if (!config.refreshSecret || config.refreshSecret.length < 32) {
  throw new Error("REFRESH_SECRET must be set and at least 32 characters");
}