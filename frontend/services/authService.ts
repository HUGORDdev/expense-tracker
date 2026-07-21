import { apiFetch } from "@/utils/api";
import type { AuthCredentials, AuthResponse, RegisterPayload, User } from "@/types";

// ---------------------------------------------------------------------------
// Service d'authentification.
// Les fonctions ci-dessous utilisent des mocks pour que l'UI fonctionne
// immédiatement en local. Remplacez le corps de chaque fonction par
// l'appel `apiFetch` réel commenté juste en dessous.
// ---------------------------------------------------------------------------

function fakeDelay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function fakeToken(email: string) {
  // Génère un pseudo-JWT lisible pour le mock (non sécurisé, uniquement pour la démo UI)
  const payload = btoa(JSON.stringify({ sub: email, exp: Date.now() + 7 * 24 * 3600 * 1000 }));
  return `mock.${payload}.signature`;
}

export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
  // --- MOCK (à supprimer une fois l'API branchée) ---
  if (!credentials.email || !credentials.password) {
    throw new Error("Email et mot de passe requis.");
  }
  // return fakeDelay({ user, token: fakeToken(credentials.email) });

  // --- APPEL RÉEL ---
  // TODO: Connecter à l'API Express/Bun (POST /api/auth/login)
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    auth: false,
  });
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  // --- MOCK (à supprimer une fois l'API branchée) ---
  if (!payload.email || !payload.password || !payload.name) {
    throw new Error("Tous les champs sont requis.");
  }
  const user: User = { id: "usr_new", name: payload.name, email: payload.email };
  // return fakeDelay({ user, token: fakeToken(payload.email) });

  // --- APPEL RÉEL ---
  console.log("voici les donners du payload ",JSON.stringify(payload))
  // TODO: Connecter à l'API Express/Bun (POST /api/auth/register)
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

export async function fetchCurrentUser(): Promise<User> {
  // --- MOCK ---
  return fakeDelay(
    { id: "usr_1", name: "Utilisateur Démo", email: "demo@example.com" },
    200
  );

  // --- APPEL RÉEL ---
  // TODO: Connecter à l'API Express/Bun (GET /api/auth/me)
  // return apiFetch<User>("/auth/me");
}

export async function logout(): Promise<void> {
  // --- MOCK : rien à faire côté serveur ---
  // return fakeDelay(undefined, 100);

  // --- APPEL RÉEL (si votre API invalide le token côté serveur) ---
  // TODO: Connecter à l'API Express/Bun (POST /api/auth/logout)
  return apiFetch<void>("/auth/logout", { method: "POST" });
}
