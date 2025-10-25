"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * Map des erreurs Next-auth vers des messages en français
 */
const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Erreur de configuration",
    description:
      "Il y a un problème avec la configuration du serveur. Veuillez contacter le support.",
  },
  AccessDenied: {
    title: "Accès refusé",
    description:
      "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.",
  },
  Verification: {
    title: "Lien de vérification invalide",
    description:
      "Le lien de connexion a expiré ou est invalide. Veuillez en demander un nouveau.",
  },
  Default: {
    title: "Erreur d'authentification",
    description:
      "Une erreur est survenue lors de l'authentification. Veuillez réessayer.",
  },
};

/**
 * Composant de contenu de la page d'erreur
 * Séparé pour pouvoir utiliser useSearchParams avec Suspense
 */
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";

  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-2xl text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Erreur"
            >
              <title>Erreur</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          {errorInfo.title}
        </h1>

        <p className="text-gray-300 mb-6">{errorInfo.description}</p>

        {error === "Verification" && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-200 mb-2">💡 Lien expiré ?</p>
            <p className="text-xs text-blue-300/80">
              Les liens de connexion expirent après 24 heures pour des raisons
              de sécurité. Demandez-en un nouveau.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Retourner à la connexion
          </Link>

          {error === "AccessDenied" && (
            <Link
              href="/"
              className="block text-sm text-purple-300 hover:text-purple-200 transition"
            >
              Retourner à l'accueil
            </Link>
          )}
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-left">
            <p className="text-xs text-yellow-200 font-mono">
              Debug: Error code = {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Page d'erreur d'authentification
 * Gère les erreurs retournées par Next-auth
 */
export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <div className="text-white">Chargement...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
