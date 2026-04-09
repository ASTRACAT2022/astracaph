import { headers } from "next/headers";
import { SiteShell } from "@/components/site-shell";
import { getDictionary, resolveLocale } from "@/lib/i18n";

export default async function HelpPage() {
  const locale = resolveLocale((await headers()).get("accept-language"));
  const dictionary = getDictionary(locale);
  const integrationTitle =
    locale === "ru" ? "Iframe Integration API" : "Iframe Integration API";
  const integrationSubtitle =
    locale === "ru"
      ? "Ниже приведён совместимый сценарий интеграции через iframe, postMessage и server-to-server verify-запрос без обязательных frontend-ключей."
      : "Below is a compatible integration flow using the iframe widget, postMessage, and server-to-server verification without mandatory frontend keys.";
  const iframeSnippet = String.raw`<iframe
  src={\`${process.env.NEXT_PUBLIC_APP_URL || 'https://caph.astracat.ru'}/captcha/widget?theme=dark\`}
  width="350"
  height="500"
  frameBorder="0"
  scrolling="no"
></iframe>`;
  const listenerSnippet = String.raw`window.addEventListener("message", (event) => {
  if (event.origin !== (process.env.NEXT_PUBLIC_APP_URL || "https://caph.astracat.ru")) {
    return;
  }

  if (event.data.type === "astracaph-verified") {
    const { token, success } = event.data.detail;

    if (success) {
      fetch("/your-backend-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
    }
  }
});`;
  const nodeSnippet = String.raw`app.post("/your-backend-endpoint", async (req, res) => {
  const { token } = req.body;
  const expectedOrigin = process.env.CAPTCHA_EXPECTED_ORIGIN || "https://example.com";

  try {
    const response = await fetch(
      \`${process.env.NEXT_PUBLIC_APP_URL || "https://caph.astracat.ru"}/public/api/v1/verify\`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, origin: expectedOrigin }),
      }
    );

    const data = await response.json();

    if (data.success) {
      res.status(200).json({ message: "CAPTCHA verified successfully." });
    } else {
      res.status(400).json({ message: "CAPTCHA verification failed." });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});`;
  const pythonSnippet = String.raw`import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/your-backend-endpoint", methods=["POST"])
def verify_captcha():
    token = request.json.get("token")
    expected_origin = os.environ.get("CAPTCHA_EXPECTED_ORIGIN", "https://example.com")
    captcha_verify_url = f"{os.environ.get('NEXT_PUBLIC_APP_URL', 'https://caph.astracat.ru')}/public/api/v1/verify"

    try:
        response = requests.post(
            captcha_verify_url,
            json={"token": token, "origin": expected_origin}
        )
        response.raise_for_status()
        data = response.json()

        if data.get("success"):
            return jsonify({"message": "CAPTCHA verified successfully."}), 200

        return jsonify({"message": "CAPTCHA verification failed."}), 400
    except requests.exceptions.RequestException:
        return jsonify({"message": "Internal server error."}), 500`;
  const responseSnippet = `{
  "success": true,
  "message": "Verification successful"
}`;

  return (
    <SiteShell
      locale={locale}
      eyebrow={dictionary.help.eyebrow}
      title={dictionary.help.title}
      subtitle={dictionary.help.subtitle}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          {dictionary.help.steps.map((step) => (
            <section
              key={step.title}
              className="rounded-[28px] border border-line bg-panel/88 p-6 shadow-panel backdrop-blur-xl"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-white">{step.title}</h2>
              <pre className="mt-4 overflow-x-auto rounded-3xl border border-line bg-night p-5 text-sm leading-7 text-white">
                {step.snippet}
              </pre>
            </section>
          ))}
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-panel/88 p-6 shadow-panel backdrop-blur-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {dictionary.help.flowNotes}
            </h2>
            <div className="mt-5 space-y-4">
              {dictionary.help.apiNotes.map((item) => (
                <p
                  key={item}
                  className="rounded-2xl border border-line bg-night/80 px-4 py-4 text-sm leading-7 text-steel"
                >
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-panel/88 p-6 shadow-panel backdrop-blur-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {dictionary.help.environment}
            </h2>
            <pre className="mt-4 overflow-x-auto rounded-3xl border border-line bg-night p-5 text-sm leading-7 text-white">
{`ASTRACAPH_TOKEN_SECRET=replace_with_long_random_secret
# Optional if you want strict secret-based verification for a custom site:
ASTRACAPH_OPEN_SECRET=replace_with_private_open_verify_secret
# Optional seeded sites for internal or enterprise bindings:
ASTRACAPH_SITE_CONFIG=[{"name":"Seed Site","siteKey":"pk_live_example","secret":"sk_live_example","origins":["https://example.com"],"createdAt":0}]
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
VERIFY_TRUSTED_IPS=203.0.113.10,203.0.113.11`}
            </pre>
          </section>
        </div>
      </div>

      <section className="mt-8 rounded-[28px] border border-line bg-panel/88 p-6 shadow-panel backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral">
          {integrationTitle}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {locale === "ru"
            ? "Совместимая iframe-документация для сайтов и бэкендов"
            : "Compatible iframe docs for websites and backends"}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-steel">
          {integrationSubtitle}
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-[24px] border border-line bg-night/80 p-5">
            <h3 className="text-xl font-semibold text-white">
              {locale === "ru" ? "1. Iframe widget" : "1. Iframe widget"}
            </h3>
            <pre className="mt-4 overflow-x-auto rounded-3xl border border-line bg-[#050a12] p-5 text-sm leading-7 text-white">
              {iframeSnippet}
            </pre>
          </section>

          <section className="rounded-[24px] border border-line bg-night/80 p-5">
            <h3 className="text-xl font-semibold text-white">
              {locale === "ru" ? "2. postMessage listener" : "2. postMessage listener"}
            </h3>
            <pre className="mt-4 overflow-x-auto rounded-3xl border border-line bg-[#050a12] p-5 text-sm leading-7 text-white">
              {listenerSnippet}
            </pre>
          </section>

          <section className="rounded-[24px] border border-line bg-night/80 p-5">
            <h3 className="text-xl font-semibold text-white">
              {locale === "ru" ? "3. Backend verify: Node.js" : "3. Backend verify: Node.js"}
            </h3>
            <pre className="mt-4 overflow-x-auto rounded-3xl border border-line bg-[#050a12] p-5 text-sm leading-7 text-white">
              {nodeSnippet}
            </pre>
          </section>

          <section className="rounded-[24px] border border-line bg-night/80 p-5">
            <h3 className="text-xl font-semibold text-white">
              {locale === "ru" ? "4. Backend verify: Python" : "4. Backend verify: Python"}
            </h3>
            <pre className="mt-4 overflow-x-auto rounded-3xl border border-line bg-[#050a12] p-5 text-sm leading-7 text-white">
              {pythonSnippet}
            </pre>
          </section>
        </div>

        <section className="mt-6 rounded-[24px] border border-line bg-night/80 p-5">
          <h3 className="text-xl font-semibold text-white">
            {locale === "ru" ? "Пример успешного ответа" : "Example successful response"}
          </h3>
          <pre className="mt-4 overflow-x-auto rounded-3xl border border-line bg-[#050a12] p-5 text-sm leading-7 text-white">
            {responseSnippet}
          </pre>
        </section>
      </section>
    </SiteShell>
  );
}
