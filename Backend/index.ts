// src/server.ts
import express from "express";
import cors from "cors";
import { config } from "./src/config";
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  sessions,
} from "./src/routes/auth";
import { getProfile, getDashboard, updateSettings } from "./src/routes/protected";
import { cleanupExpiredTokens } from "./src/utils/tokenStore";
import { innitDB } from "./src/config/db";

const app = express();

innitDB()

// Middlewares indispensables
app.use(cors());
app.use(express.json()); // Remplace le besoin de parser manuellement les requêtes JSON !

// --- Routes d'Authentification ---
app.post("/auth/register", register);
app.post("/auth/login", login);
app.post("/auth/refresh", refresh);
app.post("/auth/logout", logout);
app.post("/auth/logout-all", logoutAll);
app.get("/auth/sessions", sessions);

// --- Routes Protégées ---
app.get("/api/profile", getProfile);
app.get("/api/dashboard", getDashboard);
app.post("/api/settings", updateSettings);

// --- Health Check ---
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// --- Gestion des erreurs 404 (Not Found) ---
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Démarrage du serveur via Express (Bun l'exécute en tâche de fond)
app.listen(config.port, () => {
  console.log(`Express server running on http://localhost:${config.port}`);
});

// Nettoyage périodique des tokens
setInterval(() => {
  const removed = cleanupExpiredTokens();
  if (removed > 0) {
    console.log(`Cleaned up ${removed} expired tokens`);
  }
}, 60 * 60 * 1000);