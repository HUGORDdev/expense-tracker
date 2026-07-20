// src/middleware/auth.ts
// Authentication middleware for protecting routes

import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken, type TokenPayload } from "../utils/jwt";

// Extended request type with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Response helper for JSON responses
// function jsonResponse(data: object, status: number = 200): Response {
//   return new Response(JSON.stringify(data), {
//     status,
//     headers: { "Content-Type": "application/json" },
//   });
// }

// Middleware function that validates JWT and attaches user to request
export async function authMiddleware(
  request: AuthenticatedRequest,
  res:Response,
  next:NextFunction,
){
  // Extract Authorization header
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return res.status(401).json(
      { error: "Authorization header missing" }
    );
  }

  // Validate Bearer token format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json(
      { error: "Invalid authorization format. Use: Bearer <token>" }
    );
  }

  // Extract the token part
  const token = authHeader.substring(7);

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const payload = await verifyAccessToken(token);
    
    // On attache les informations de l'utilisateur à la requête Express
    request.user = payload;
    
    // On passe au handler suivant
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

// Higher-order function to wrap route handlers with authentication
// export function withAuth(
//   handler: (req: AuthenticatedRequest,res:Response) => Promise<any>
// ): (req: Request) => Promise<Response> {
//   return async (req: Request,res:Response) => {

//     const authHeader = req.headers.authorization
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ error: "Authentification requise" });
//     }

//     const token = authHeader.substring(7);

//     try{
//       // Run authentication middleware
//       const payload = await verifyAccessToken(token)
//       const result = await authMiddleware(req as AuthenticatedRequest,res);
  
//       // If middleware returned a Response, it means auth failed
//       if (result instanceof Response) {
//         return result;
//       }
  
//       // Auth succeeded, call the actual handler
//       return handler(result);
//     }catch(error){
//       return res.status(401).json({error:"Token invalid ou expire"})
//     }
//   };
// }
// export function withAuth(
//   handler: (req: AuthenticatedRequest, res: Response) => Promise<any>
// ) {
//   return async (req: Request, res: Response) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ error: "Authentification requise" });
//     }

//     const token = authHeader.substring(7);

//     try {
//       const payload = await verifyAccessToken(token);
//       (req as AuthenticatedRequest).user = payload;

//       return await handler(req as AuthenticatedRequest, res);
//     } catch (error) {
//       return res.status(401).json({ error: "Token invalide ou expiré" });
//     }
//   };
// }
export function withAuth(
  handler: (req: AuthenticatedRequest, res: Response) => Promise<any>
) {
  return async (req: Request, res: Response) => {
    // On simule le passage dans le middleware
    await authMiddleware(req as AuthenticatedRequest, res, async () => {
      // Le next() n'est exécuté QUE si authMiddleware a réussi !
      return await handler(req as AuthenticatedRequest, res);
    });
  };
}