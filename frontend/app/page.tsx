import { redirect } from "next/navigation";

export default function RootPage() {
  // La page d'accueil redirige directement vers le dashboard.
  // Le middleware se charge de rediriger vers /login si l'utilisateur
  // n'est pas authentifié.
  redirect("/dashboard");
}
