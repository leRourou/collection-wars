"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Page de connexion avec EmailProvider (Magic Link)
 * L'utilisateur entre son email et reçoit un lien de connexion
 */
export default function LoginPage() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);

      // Appel à signIn avec le provider "nodemailer"
      const result = await signIn("nodemailer", {
        email: data.email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Une erreur est survenue lors de l'envoi de l'email");
        return;
      }

      // Succès - l'email a été envoyé
      setIsEmailSent(true);
    } catch (err) {
      console.error("Login error:", err);
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
            <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-purple-400"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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

          <p className="text-sm text-gray-400 mb-6">
            Cliquez sur le lien dans l'email pour vous connecter. Le lien
            expirera dans 24 heures.
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-2xl">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            Collection Wars
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Connectez-vous avec votre email
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
            <p className="text-sm text-blue-200">
              💡 Nous vous enverrons un lien magique pour vous connecter en
              toute sécurité, sans mot de passe.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting
                ? "Envoi en cours..."
                : "Envoyer le lien de connexion"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="text-sm text-purple-300 hover:text-purple-200 transition"
            >
              Première visite ? Créez votre compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
