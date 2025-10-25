import mjml2html from "mjml";
import transporter from "../lib/transporter";
import getConnectionEmailTemplate from "../templates/magic-email";

interface SendMagicLinkParams {
  email: string;
  url: string;
}

/**
 * Envoie un email avec lien magique de connexion
 * @param param0 Objet contenant l'email du destinataire et l'URL de connexion
 * @return void
 */
export async function sendMagicLinkEmail({ email, url }: SendMagicLinkParams) {
  const mjmlTemplate = getConnectionEmailTemplate(url, email);
  const { html, errors } = mjml2html(mjmlTemplate);

  if (errors.length > 0) {
    console.error("MJML compilation errors:", errors);
    for (const err of errors) {
      console.error(err.formattedMessage);
    }
    throw new Error("Failed to compile email template");
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@collectionwars.com",
      to: email,
      subject: "Connexion à Collection Wars",
      html,
    });
  } catch (error) {
    console.error("Error sending magic link email:", error);
    throw new Error("Failed to send magic link email");
  }
}
