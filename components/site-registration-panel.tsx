"use client";

import { startTransition, type FormEvent, useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

type RegistrationResult = {
  success: boolean;
  site: {
    name: string;
    siteKey: string;
    secret: string;
    origins: string[];
  };
  embed: string;
  verifyExample: string;
  warning?: string;
};

export function SiteRegistrationPanel({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const [domain, setDomain] = useState("");
  const [siteName, setSiteName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegistrationResult | null>(null);

  function downloadBackupFile(payload: RegistrationResult) {
    const hostname = payload.site.origins[0]
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9.-]+/gi, "_");
    const contents = [
      dictionary.registration.backupTitle,
      `Created: ${new Date().toISOString()}`,
      "",
      dictionary.registration.backupImportant,
      dictionary.registration.backupWarningOne,
      dictionary.registration.backupWarningTwo,
      "",
      `${dictionary.registration.backupSiteName}: ${payload.site.name}`,
      `${dictionary.registration.backupOrigin}: ${payload.site.origins[0]}`,
      `${dictionary.registration.backupPublicKey}: ${payload.site.siteKey}`,
      `${dictionary.registration.backupPrivateSecret}: ${payload.site.secret}`,
      "",
      `${dictionary.registration.embed}:`,
      payload.embed,
      "",
      `${dictionary.registration.verify}:`,
      payload.verifyExample,
      "",
    ].join("\n");

    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `astracaph-${hostname || "keys"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      setIsPending(true);
      try {
        const response = await fetch("/api/v1/sites", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            domain,
            name: siteName,
          }),
        });

        const data = (await response.json()) as RegistrationResult & { error?: string };
        if (!response.ok) {
          setResult(null);
          setError(data.error ?? dictionary.registration.issueError);
          return;
        }

        setResult(data);
      } catch {
        setResult(null);
        setError(dictionary.registration.issueNetworkError);
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <section className="rounded-[30px] border border-line bg-panel/88 p-7 shadow-panel backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral">
        {dictionary.registration.section}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {dictionary.registration.title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-steel">
        {dictionary.registration.subtitle}
      </p>
      <div className="mt-4 rounded-2xl border border-coral/25 bg-coral/10 px-4 py-4 text-sm leading-7 text-white">
        {dictionary.registration.warning}
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-steel/75">
            {dictionary.registration.domainLabel}
          </span>
          <input
            required
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder={dictionary.registration.domainPlaceholder}
            className="w-full rounded-2xl border border-line bg-night/80 px-4 py-3 text-sm text-white outline-none transition focus:border-coral"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-steel/75">
            {dictionary.registration.siteNameLabel}
          </span>
          <input
            value={siteName}
            onChange={(event) => setSiteName(event.target.value)}
            placeholder={dictionary.registration.siteNamePlaceholder}
            className="w-full rounded-2xl border border-line bg-night/80 px-4 py-3 text-sm text-white outline-none transition focus:border-coral"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-coral/30 bg-coral/14 px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral/22 disabled:cursor-wait disabled:opacity-75"
        >
          {isPending ? dictionary.registration.submitPending : dictionary.registration.submit}
        </button>
      </form>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-coral/25 bg-coral/10 px-4 py-4 text-sm text-white">
            {dictionary.registration.successLead}{" "}
            <span className="font-semibold">{result.site.origins[0]}</span>.{" "}
            {dictionary.registration.successTail}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-night/80 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-steel/75">
                {dictionary.registration.publicKey}
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-white">
                {result.site.siteKey}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-night/80 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.25em] text-steel/75">
                {dictionary.registration.privateSecret}
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-white">
                {result.site.secret}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadBackupFile(result)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:border-coral/40 hover:bg-coral/12"
            >
              {dictionary.registration.download}
            </button>
            <div className="rounded-full border border-line bg-night/70 px-4 py-3 text-sm text-steel">
              {dictionary.registration.keepSecret}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-steel/75">
              {dictionary.registration.embed}
            </p>
            <pre className="overflow-x-auto rounded-3xl border border-line bg-night p-5 text-sm leading-7 text-white">
              {result.embed}
            </pre>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-steel/75">
              {dictionary.registration.verify}
            </p>
            <pre className="overflow-x-auto rounded-3xl border border-line bg-night p-5 text-sm leading-7 text-white">
              {result.verifyExample}
            </pre>
          </div>
        </div>
      ) : null}
    </section>
  );
}
