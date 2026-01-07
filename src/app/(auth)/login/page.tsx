"use client";

import { useState } from "react";
import { EmailSent, LoginForm } from "./_components";

export default function LoginPage() {
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-primary/5 min-h-screen">
      {sentToEmail ? (
        <EmailSent email={sentToEmail} onResend={() => setSentToEmail(null)} />
      ) : (
        <LoginForm onEmailSent={setSentToEmail} />
      )}
    </div>
  );
}
