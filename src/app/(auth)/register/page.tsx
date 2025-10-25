"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Page d'inscription avec EmailProvider (Magic Link)
 * Avec EmailProvider, l'inscription et la connexion utilisent le même flow
 * Le compte est créé automatiquement lors de la première connexion
 */
export default function RegisterPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);

      // Même mécanisme que login - le compte sera créé automatiquement
      const result = await signIn("nodemailer", {
        email: data.email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Une erreur est survenue lors de l'envoi de l'email");
        return;
      }

      setIsEmailSent(true);
    } catch (err) {
      console.error("Register error:", err);
      setError("Une erreur inattendue est survenue");
    }
  };

  // État de confirmation après envoi de l'email
  if (isEmailSent) {
    const email = getValues("email");

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-2xl text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Email envoyé"
              >
                <title>Email envoyé</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Vérifiez votre email
          </h2>

          <p className="text-gray-300 mb-2">
            Un lien de connexion a été envoyé à :
          </p>

          <p className="text-purple-300 font-semibold mb-6">{email}</p>

          <p className="text-sm text-gray-400 mb-2">
            Cliquez sur le lien dans l'email pour finaliser votre inscription et
            accéder à votre compte.
          </p>

          <p className="text-xs text-gray-500 mb-6">
            Le lien expirera dans 24 heures.
          </p>

          <button
            type="button"
            onClick={() => setIsEmailSent(false)}
            className="text-purple-300 hover:text-purple-200 transition text-sm"
          >
            Renvoyer un email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-2xl">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            Collection Wars
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Créez votre compte
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-white/20 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200 mb-2">
              🔒 Connexion sécurisée sans mot de passe
            </p>
            <p className="text-xs text-blue-300/80">
              Nous vous enverrons un lien magique pour créer et accéder à votre
              compte en toute sécurité.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "Envoi en cours..." : "Créer mon compte"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-purple-300 hover:text-purple-200 transition"
            >
              Déjà un compte ? Connectez-vous
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
