const getConnectionEmailTemplate = (url: string, email: string) => `
    <mjml>
      <mj-head>
        <mj-title>Connexion à Collection Wars</mj-title>
        <mj-preview>Cliquez sur le lien pour vous connecter à votre compte</mj-preview>
        <mj-attributes>
          <mj-all font-family="Arial, sans-serif" />
          <mj-text font-size="14px" color="#555555" line-height="20px" />
          <mj-section background-color="#ffffff" padding="20px" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f4">
        <!-- Header -->
        <mj-section background-color="#1a1a2e" padding="30px 20px">
          <mj-column>
            <mj-text align="center" color="#ffffff" font-size="28px" font-weight="bold">
              Collection Wars
            </mj-text>
          </mj-column>
        </mj-section>

        <!-- Main Content -->
        <mj-section background-color="#ffffff" padding="40px 30px">
          <mj-column>
            <mj-text font-size="20px" color="#333333" font-weight="bold" padding-bottom="20px">
              Connexion à votre compte
            </mj-text>

            <mj-text color="#555555" padding-bottom="10px">
              Vous avez demandé à vous connecter à <strong>Collection Wars</strong>.
            </mj-text>

            <mj-text color="#555555" padding-bottom="20px">
              Cliquez sur le bouton ci-dessous pour vous connecter en toute sécurité :
            </mj-text>

            <mj-button
              background-color="#7c3aed"
              color="#ffffff"
              font-size="16px"
              font-weight="bold"
              href="${url}"
              padding="20px 0"
              border-radius="8px"
            >
              Se connecter
            </mj-button>

            <mj-text color="#888888" font-size="12px" padding-top="20px">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </mj-text>

            <mj-text color="#7c3aed" font-size="12px" padding-top="5px">
              ${url}
            </mj-text>

            <mj-divider border-color="#e0e0e0" padding="30px 0" />

            <mj-text color="#888888" font-size="12px">
              Ce lien de connexion expirera dans 24 heures. Si vous n'avez pas demandé cette connexion, vous pouvez ignorer cet email en toute sécurité.
            </mj-text>
          </mj-column>
        </mj-section>

        <!-- Footer -->
        <mj-section background-color="#f4f4f4" padding="20px">
          <mj-column>
            <mj-text align="center" color="#888888" font-size="12px">
              © ${
  new Date().getFullYear()
} Collection Wars. Tous droits réservés.
            </mj-text>
            <mj-text align="center" color="#888888" font-size="12px" padding-top="10px">
              Cet email a été envoyé à ${email}
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

export default getConnectionEmailTemplate;
