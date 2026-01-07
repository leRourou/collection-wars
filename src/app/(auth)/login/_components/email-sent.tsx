import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EmailSentProps {
  email: string;
  onResend: () => void;
}

export function EmailSent({ email, onResend }: EmailSentProps) {
  return (
    <Card className="w-full max-w-sm text-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail />
          Vérifiez votre email
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Un lien de connexion a été envoyé à :</p>
        <p className="text-primary font-semibold ">{email}</p>
        <p className="mt-4 italic">
          Cliquez sur le lien dans l'email pour vous connecter. Le lien expirera
          dans 24 heures.
        </p>
      </CardContent>

      <CardFooter>
        <Button type="button" onClick={onResend} className="w-full">
          Renvoyer un email
        </Button>
      </CardFooter>
    </Card>
  );
}
