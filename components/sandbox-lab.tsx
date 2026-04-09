"use client";

import { useEffect, useMemo, useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

type LogEntry = {
  id: string;
  createdAt: number;
  route: string;
  method: string;
  siteKey?: string;
  ip?: string;
  status: number;
  summary: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
};

type PreviewMessage =
  | { type: "sandbox:verified"; token: string; detail: unknown }
  | { type: "sandbox:submit"; token: string }
  | { type: "sandbox:error"; message: string };

function createDefaultMarkup(locale: Locale) {
  const copy = getDictionary(locale).sandbox;

  return `<form id="demo-form" style="display:grid;gap:14px;max-width:560px;">
  <label style="display:grid;gap:6px;">
    <span>${copy.templateName}</span>
    <input name="name" placeholder="${copy.templateNamePlaceholder}" style="padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#08101a;color:#fff;" />
  </label>
  <label style="display:grid;gap:6px;">
    <span>${copy.templateEmail}</span>
    <input name="email" type="email" placeholder="${copy.templateEmailPlaceholder}" style="padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#08101a;color:#fff;" />
  </label>
  <div id="astracaph-container" data-sitekey="public_demo_key"></div>
  <button type="submit" style="padding:12px 16px;border-radius:999px;border:1px solid rgba(78,167,255,.35);background:rgba(78,167,255,.16);color:#fff;font-weight:700;">
    ${copy.templateButton}
  </button>
</form>`;
}

export function SandboxLab({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).sandbox;
  const [markup, setMarkup] = useState(() => createDefaultMarkup(locale));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastToken, setLastToken] = useState("");
  const [verifyResult, setVerifyResult] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    function onMessage(event: MessageEvent<PreviewMessage>) {
      if (!event.data || typeof event.data !== "object") {
        return;
      }

      if (event.data.type === "sandbox:verified") {
        setLastToken(event.data.token);
        setPreviewMessage(copy.verifiedCaptured);
      }

      if (event.data.type === "sandbox:submit") {
        setLastToken(event.data.token);
        setPreviewMessage(copy.submitCaptured);
      }

      if (event.data.type === "sandbox:error") {
        setPreviewMessage(event.data.message);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [copy.submitCaptured, copy.verifiedCaptured]);

  useEffect(() => {
    let active = true;

    async function pollLogs() {
      try {
        const response = await fetch("/api/v1/logs?siteKey=public_demo_key&limit=30", {
          cache: "no-store",
        });
        const data = (await response.json()) as { logs?: LogEntry[] };

        if (active) {
          setLogs(data.logs ?? []);
        }
      } catch {
        if (active) {
          setLogs([]);
        }
      }
    }

    void pollLogs();
    const interval = window.setInterval(pollLogs, 1600);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  async function verifyLatestToken() {
    if (!lastToken) {
      setVerifyResult(copy.verifyEmpty);
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/v1/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          secret: "private_demo_secret",
          token: lastToken,
        }),
      });
      const data = (await response.json()) as Record<string, unknown>;
      setVerifyResult(JSON.stringify(data, null, 2));
    } catch {
      setVerifyResult(copy.verifyFailed);
    } finally {
      setIsVerifying(false);
    }
  }

  const srcDoc = useMemo(() => {
    return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        margin: 0;
        padding: 24px;
        background:
          radial-gradient(circle at top, rgba(78,167,255,.14), transparent 24%),
          linear-gradient(180deg, #08101a 0%, #050a12 100%);
        color: #ebf4ff;
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      }
      .frame {
        border: 1px solid rgba(124,196,255,.16);
        background: rgba(15,23,38,.88);
        border-radius: 24px;
        padding: 20px;
        box-shadow: 0 30px 90px rgba(0,0,0,.45);
      }
      .hint {
        margin: 0 0 16px;
        color: #8fa3bf;
        font-size: 14px;
        line-height: 1.7;
      }
      * { box-sizing: border-box; }
    </style>
  </head>
  <body>
    <div class="frame">
      <p class="hint">${copy.previewHint}</p>
      ${markup}
    </div>
    <script src="/api/v1/widget.js" async defer></script>
    <script>
      window.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("demo-form");
        if (form) {
          form.addEventListener("submit", (event) => {
            event.preventDefault();
            const tokenField = form.querySelector('input[name="astracaph-response"]');
            window.parent.postMessage({
              type: "sandbox:submit",
              token: tokenField ? tokenField.value : ""
            }, "*");
          });
        }

        const container = document.getElementById("astracaph-container");
        if (container) {
          container.addEventListener("astracaph:verified", (event) => {
            const detail = event.detail || {};
            window.parent.postMessage({
              type: "sandbox:verified",
              token: detail.token || "",
              detail
            }, "*");
          });
        } else {
          window.parent.postMessage({
            type: "sandbox:error",
            message: ${JSON.stringify(copy.missingContainer)}
          }, "*");
        }
      });
    </script>
  </body>
</html>`;
  }, [copy.missingContainer, copy.previewHint, locale, markup]);

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr_0.95fr]">
        <div className="rounded-[30px] border border-line bg-panel/88 p-6 shadow-panel backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral">
            {copy.editorLabel}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {copy.editorTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-steel">{copy.editorBody}</p>
          <p className="mt-3 rounded-2xl border border-line bg-night/70 px-4 py-4 text-sm leading-7 text-steel">
            {copy.editorHint}
          </p>
          <textarea
            value={markup}
            onChange={(event) => setMarkup(event.target.value)}
            spellCheck={false}
            className="mt-5 h-[34rem] w-full rounded-3xl border border-line bg-night p-4 font-mono text-sm leading-7 text-white outline-none transition focus:border-coral"
          />
        </div>

        <div className="rounded-[30px] border border-line bg-panel/88 p-6 shadow-panel backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral">
            {copy.previewLabel}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {copy.previewTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-steel">{copy.previewBody}</p>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-line bg-night">
            <iframe
              title="AstraCaph sandbox preview"
              srcDoc={srcDoc}
              sandbox="allow-forms allow-scripts"
              className="h-[34rem] w-full border-0 bg-night"
            />
          </div>

          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl border border-line bg-night/80 px-4 py-4 text-sm text-steel">
              {copy.latestToken}
              <div className="mt-2 break-all font-mono text-xs leading-6 text-white">
                {lastToken || copy.noToken}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-night/80 px-4 py-4 text-sm text-steel">
              {copy.previewEvents}
              <div className="mt-2 text-white">{previewMessage || copy.waitingEvents}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void verifyLatestToken()}
                disabled={isVerifying}
                className="rounded-full border border-coral/30 bg-coral/14 px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral/22 disabled:cursor-wait disabled:opacity-75"
              >
                {isVerifying ? copy.verifyingAction : copy.verifyAction}
              </button>
              <div className="rounded-full border border-line bg-night/70 px-4 py-3 text-sm text-steel">
                {copy.demoPair}
              </div>
            </div>
            <pre className="overflow-x-auto rounded-3xl border border-line bg-night p-5 text-xs leading-6 text-white">
              {verifyResult || copy.verifyPlaceholder}
            </pre>
          </div>
        </div>

        <div className="rounded-[30px] border border-line bg-panel/88 p-6 shadow-panel backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral">
            {copy.logsLabel}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {copy.logsTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-steel">{copy.logsBody}</p>

          <div className="mt-5 space-y-3">
            {logs.length === 0 ? (
              <div className="rounded-2xl border border-line bg-night/80 px-4 py-4 text-sm text-steel">
                {copy.noLogs}
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-line bg-night/80 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {log.method} {log.route}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-steel/75">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-white">
                      {log.status}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-steel">{log.summary}</p>
                  <pre className="mt-3 overflow-x-auto rounded-2xl border border-line bg-[#050a12] p-4 text-xs leading-6 text-white">
                    {JSON.stringify({ request: log.request, response: log.response }, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
