const getConnectionEmailTemplate = (url: string, email: string) => `
    <mjml>
      <mj-head>
        <mj-title>Connexion à Collection Wars</mj-title>
        <mj-preview>Cliquez sur le lien pour vous connecter à votre compte</mj-preview>
        <mj-attributes>
          <mj-all font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" />
          <mj-text font-size="14px" color="#334155" line-height="22px" />
          <mj-section background-color="#ffffff" padding="20px" />
        </mj-attributes>
        <mj-style>
          .gradient-bg {
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          }
          .card-shadow {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
        </mj-style>
      </mj-head>
      <mj-body background-color="#f1f5f9">
        <!-- Header -->
        <mj-section css-class="gradient-bg" padding="40px 20px">
          <mj-column>
            <mj-text align="center" color="#ffffff" font-size="32px" font-weight="bold" letter-spacing="1px">
              ⚔️ Collection Wars
            </mj-text>
            <mj-text align="center" color="#e0f2fe" font-size="14px" padding-top="10px">
              Votre aventure vous attend
            </mj-text>
          </mj-column>
        </mj-section>

        <!-- Main Content -->
        <mj-section background-color="#ffffff" padding="40px 30px" css-class="card-shadow" border-radius="12px">
          <mj-column>
            <mj-text font-size="24px" color="#0f172a" font-weight="bold" padding-bottom="20px" align="center">
              🎮 Connexion à votre compte
            </mj-text>

            <mj-text color="#475569" padding-bottom="10px" line-height="24px">
              Bonjour,
            </mj-text>

            <mj-text color="#475569" padding-bottom="20px" line-height="24px">
              Vous avez demandé à vous connecter à <strong style="color: #0ea5e9;">Collection Wars</strong>.
              Cliquez sur le bouton ci-dessous pour accéder à votre compte en toute sécurité.
            </mj-text>

            <mj-button
              background-color="#0ea5e9"
              color="#ffffff"
              font-size="16px"
              font-weight="bold"
              href="${url}"
              padding="20px 0"
              border-radius="10px"
              inner-padding="16px 32px"
            >
              🔐 Se connecter maintenant
            </mj-button>

            <mj-divider border-color="#e2e8f0" padding="30px 0" border-width="2px" />

            <mj-text color="#64748b" font-size="13px" padding-bottom="10px">
              <strong>Le bouton ne fonctionne pas ?</strong>
            </mj-text>

            <mj-text color="#64748b" font-size="12px" padding-bottom="10px">
              Copiez et collez ce lien dans votre navigateur :
            </mj-text>

            <mj-text
              color="#0ea5e9"
              font-size="11px"
              padding="10px 15px"
              background-color="#f0f9ff"
              border-radius="6px"
            >
              ${url}
            </mj-text>

            <mj-spacer height="20px" />

            <mj-text color="#94a3b8" font-size="12px" line-height="18px">
              ⏱️ Ce lien expirera dans <strong>24 heures</strong>.<br/>
              🔒 Si vous n'avez pas demandé cette connexion, ignorez cet email.
            </mj-text>
          </mj-column>
        </mj-section>

        <!-- Footer -->
        <mj-section background-color="#f1f5f9" padding="30px 20px">
          <mj-column>
            <mj-text align="center" color="#64748b" font-size="12px">
              © ${new Date().getFullYear()} Collection Wars. Tous droits réservés.
            </mj-text>
            <mj-text align="center" color="#94a3b8" font-size="11px" padding-top="10px">
              Email envoyé à <span style="color: #0ea5e9;">${email}</span>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

export default getConnectionEmailTemplate;
