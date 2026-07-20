"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Wallet, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/utils/api";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("expired") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Identifiants invalides.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Wallet size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100">Bon retour</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Connectez-vous pour retrouver vos dépenses.
          </p>
        </div>

        {sessionExpired && (
          <div className="mb-4 rounded-lg border border-amber-600/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-400">
            Votre session a expiré. Veuillez vous reconnecter.
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            <LogIn size={16} />
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-500">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-brand-400 hover:text-brand-300">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
