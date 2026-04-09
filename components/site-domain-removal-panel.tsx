"use client";

import { startTransition, type FormEvent, useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

type DeleteResult = {
  success: boolean;
  removedOrigin: string;
  siteKey: string;
  message: string;
};

export function SiteDomainRemovalPanel({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const [domain, setDomain] = useState("");
  const [secret, setSecret] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeleteResult | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    startTransition(async () => {
      setIsPending(true);
      try {
        const response = await fetch("/api/v1/sites", {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            domain,
            secret,
          }),
        });

        const data = (await response.json()) as DeleteResult & { error?: string };
        if (!response.ok) {
          setError(data.error ?? dictionary.removal.deleteError);
          return;
        }

        setResult(data);
        setSecret("");
      } catch {
        setError(dictionary.removal.deleteNetworkError);
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <section className="rounded-[30px] border border-line bg-panel/88 p-7 shadow-panel backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral">
        {dictionary.removal.section}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {dictionary.removal.title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-steel">
        {dictionary.removal.subtitle}
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-steel/75">
            {dictionary.removal.domainLabel}
          </span>
          <input
            required
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            placeholder={dictionary.removal.domainPlaceholder}
            className="w-full rounded-2xl border border-line bg-night/80 px-4 py-3 text-sm text-white outline-none transition focus:border-coral"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-steel/75">
            {dictionary.removal.secretLabel}
          </span>
          <input
            required
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            placeholder={dictionary.removal.secretPlaceholder}
            className="w-full rounded-2xl border border-line bg-night/80 px-4 py-3 text-sm text-white outline-none transition focus:border-coral"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-coral/35 bg-coral/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral/20 disabled:cursor-wait disabled:opacity-75"
        >
          {isPending ? dictionary.removal.submitPending : dictionary.removal.submit}
        </button>
      </form>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 rounded-2xl border border-coral/25 bg-coral/10 px-4 py-4 text-sm text-white">
          {result.message} {dictionary.removal.removed}{" "}
          <span className="font-semibold">{result.removedOrigin}</span>
        </div>
      ) : null}
    </section>
  );
}
