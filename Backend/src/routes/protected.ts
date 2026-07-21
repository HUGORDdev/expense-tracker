// src/routes/protected.ts
// Example protected routes that require authentication

import type { Response } from "express";
import db from "../config/db";
import { withAuth, type AuthenticatedRequest } from "../middleware/auth";
import type { Expense } from "../types/expense";
import { prisma } from "../../prisma/db";

// const { start, end } = resolvePeriodRange(filter);

// return fakeDelay({ expenses: filtered, total: filtered.length });
// Helper for JSON responses
// function json(data: object, status: number = 200): Response {
//   return new Response(JSON.stringify(data), {
//     status,
//     headers: { "Content-Type": "application/json" },
//   });
// }

// GET /api/profile - Get current user profile
export const getProfile = withAuth(
  async (request: AuthenticatedRequest, res: Response): Promise<Response> => {
    // User info is available from the validated token
    const user = request.user!;

    return res.json({
      id: user.sub,
      email: user.email,
      tokenIssuedAt: user.iat,
      tokenExpiresAt: user.exp,
    });
  },
);

// GET /api/dashboard - Protected dashboard data
export const getDashboard = withAuth(
  async (request: AuthenticatedRequest, res: Response): Promise<Response> => {
    const user = request.user!;

    // Fetch user-specific data (example)
    const dashboardData = {
      welcome: `Hello, ${user.email}!`,
      stats: {
        lastLogin: new Date().toISOString(),
        accountAge: "30 days",
      },
    };

    return res.json(dashboardData);
  },
);

// POST /api/settings - Update user settings
export const updateSettings = withAuth(
  async (request: AuthenticatedRequest, res: Response) => {
    const user = request.user!;

    try {
      const body = await request.body();

      // Validate and process settings update
      // In production, save to database

      return res.json({
        message: "Settings updated",
        userId: user.sub,
      });
    } catch (error) {
      return res.status(400).json({ error: "Invalid request body" });
    }
  },
);

export const getExpenses = withAuth(
  async (request: AuthenticatedRequest, res: Response) => {
    const user = request.user!;
    try {
      const { start, end } = request.query;
      const dateFilter: { gte?: string; lte?: string } = {};
      if (start) dateFilter.gte = new Date(start as string).toISOString();
      if (end) dateFilter.lte = new Date(end as string).toISOString();
      const expenses = await prisma.expenses.findMany({
        where: {
          user_id: user.sub,
          date: dateFilter,
        },
        orderBy: {
          date: "desc",
        },
      });
      return res.status(200).json({
        expenses,
        total: expenses.length,
      });
    } catch (error) {
      console.log("voici l'erreur rencontrer pour avoir l'acces  ", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },
);

//POST api/expenses

// export const addExpenses = withAuth(
//     async (request:AuthenticatedRequest):Promise<Response> =>{
//         const user = request.user!
//         db.query("INSERT INTO ")
//     }
// )

export const addExpenses = withAuth(
  async (request: AuthenticatedRequest, res: Response) => {
    const user = request.user!;
    try {
      const {title,amount,category,date } = request.body;
      
      const expense = await prisma.expenses.create({
        data:{
          id:crypto.randomUUID(),
          title:title,
          amount:amount,
          category:category,
          date:date,
          user_id:user.sub
        }
      });
      // console.log('Élément ajouté :', expense)

      return res.status(201).json(expense);
    } catch (error) {
      console.log("voici l'erreur rencontrer pour avoir l'acces  ", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  },
);

