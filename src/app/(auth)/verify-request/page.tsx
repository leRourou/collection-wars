import Link from "next/link";

/**
 * Page affichée après qu'un utilisateur demande un lien de connexion
 * Cette page est utilisée par Next-auth quand redirect: false n'est pas utilisé
 */
export default function VerifyRequestPage() {
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

        <h1 className="text-2xl font-bold text-white mb-4">
          Vérifiez votre email
        </h1>

        <p className="text-gray-300 mb-6">
          Un lien de connexion a été envoyé à votre adresse email.
        </p>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-200 mb-2">
            📧 Consultez votre boîte de réception
          </p>
          <p className="text-xs text-blue-300/80">
            Cliquez sur le lien dans l'email pour vous connecter. Le lien
            expirera dans 24 heures.
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-400">
          <p>Vous ne voyez pas l'email ?</p>
          <ul className="list-disc list-inside space-y-1 text-left">
            <li>Vérifiez votre dossier spam</li>
            <li>Assurez-vous d'avoir entré la bonne adresse email</li>
            <li>Attendez quelques minutes, l'email peut prendre du temps</li>
          </ul>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <Link
            href="/login"
            className="text-purple-300 hover:text-purple-200 transition text-sm"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
