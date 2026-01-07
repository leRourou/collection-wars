import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onEmailSent: (email: string) => void;
}

export function LoginForm({ onEmailSent }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);

      const result = await signIn("nodemailer", {
        email: data.email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Une erreur est survenue lors de l'envoi de l'email");
        return;
      }

      onEmailSent(data.email);
    } catch (err) {
      console.error("Login error:", err);
      setError("Une erreur inattendue est survenue");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Connectez-vous avec votre email. Un lien de connexion vous sera
          envoyé.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid w-full max-w-sm items-center gap-3">
            <label htmlFor="email">Adresse email</label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              placeholder="votre@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-800">
                {errors.email.message}
              </p>
            )}
          </div>
          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center"
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer le lien de connexion"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
