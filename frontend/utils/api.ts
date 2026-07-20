import Cookies from "js-cookie";

// ---------------------------------------------------------------------------
// Client HTTP central de l'application.
//
// Toutes les requêtes vers l'API Express/Bun doivent passer par `apiFetch`.
// Il se charge de :
//   1. Préfixer l'URL avec la base de l'API (NEXT_PUBLIC_API_URL)
//   2. Injecter automatiquement le header `Authorization: Bearer <token>`
//   3. Rediriger vers /login si le serveur répond 401 (token expiré/absent)
//   4. Uniformiser la gestion des erreurs
// ---------------------------------------------------------------------------

export const TOKEN_COOKIE_KEY = "expense_tracker_token";

// TODO: Remplacer par l'URL réelle de votre API Express/Bun (ex: http://localhost:3001)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/** Récupère le token stocké (cookie en priorité, fallback localStorage). */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    Cookies.get(TOKEN_COOKIE_KEY) || localStorage.getItem(TOKEN_COOKIE_KEY)
  );
}

/** Sauvegarde le token à la fois en cookie (lu par le middleware serveur)
 *  et en localStorage (fallback / lecture rapide côté client). */
export function setToken(token: string) {
  if (typeof window === "undefined") return;
  Cookies.set(TOKEN_COOKIE_KEY, token, { expires: 7, sameSite: "lax" });
  localStorage.setItem(TOKEN_COOKIE_KEY, token);
}

/** Supprime le token de tous les emplacements de stockage. */
export function clearToken() {
  if (typeof window === "undefined") return;
  Cookies.remove(TOKEN_COOKIE_KEY);
  localStorage.removeItem(TOKEN_COOKIE_KEY);
}

interface ApiFetchOptions extends RequestInit {
  /** Passe à false pour un appel public (login/register) qui n'a pas besoin de token */
  auth?: boolean;
}

/**
 * Wrapper autour de `fetch` qui injecte automatiquement le header Authorization
 * et gère la redirection en cas de session expirée.
 *
 * Exemple :
 *   const data = await apiFetch<Expense[]>("/expenses");
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) {
      (finalHeaders as Record<string, string>)["Authorization"] =
        `Bearer ${token}`;
    }
  }

  // TODO: Connecter à l'API Express/Bun -> remplacer API_BASE_URL par l'URL réelle du serveur
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  // Session expirée ou token invalide : on nettoie et on redirige vers /login
  if (response.status === 401) { 
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login?expired=1";
    }
    throw new ApiError("Session expirée, veuillez vous reconnecter.", 401);
  }

  if (!response.ok) {
    let message = `Erreur API (${response.status})`;
    try {
      const body = await response.json();
      message = body?.message || message;
    } catch {
      // pas de corps JSON, on garde le message générique
    }
    throw new ApiError(message, response.status);
  }

  // Certaines réponses (ex: DELETE) peuvent être vides
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
