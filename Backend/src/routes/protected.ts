// src/routes/protected.ts
// Example protected routes that require authentication

import db from "../config/db";
import { withAuth, type AuthenticatedRequest } from "../middleware/auth";

// Helper for JSON responses
function json(data: object, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// GET /api/profile - Get current user profile
export const getProfile = withAuth(
  async (request: AuthenticatedRequest): Promise<Response> => {
    // User info is available from the validated token
    const user = request.user!;

    return json({
      id: user.sub,
      email: user.email,
      tokenIssuedAt: user.iat,
      tokenExpiresAt: user.exp,
    });
  }
);


// GET /api/dashboard - Protected dashboard data
export const getDashboard = withAuth(
    async (request: AuthenticatedRequest): Promise<Response> => {
    const user = request.user!;

    // Fetch user-specific data (example)
    const dashboardData = {
      welcome: `Hello, ${user.email}!`,
      stats: {
        lastLogin: new Date().toISOString(),
        accountAge: "30 days",
      },
    };

    return json(dashboardData);
  }
);

// POST /api/settings - Update user settings
export const updateSettings = withAuth(
  async (request: AuthenticatedRequest) => {
    const user = request.user!;

    try {
      const body = await request.body();

      // Validate and process settings update
      // In production, save to database

      return json({
        message: "Settings updated",
        userId: user.sub,
      });
    } catch (error) {
      return json({ error: "Invalid request body" }, 400);
    }
  }
);


//POST api/expenses

// export const addExpenses = withAuth(
//     async (request:AuthenticatedRequest):Promise<Response> =>{
//         const user = request.user!
//         db.query("INSERT INTO ")
        
//     }
// )