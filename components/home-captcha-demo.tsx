"use client";

import { useEffect, useRef, useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

type VerifiedDetail = {
  token?: string;
};

export function HomeCaptchaDemo({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).home;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    function onVerified(event: Event) {
      const detail = (event as CustomEvent<VerifiedDetail>).detail;
      setToken(detail?.token ?? "");
    }

    container.addEventListener("astracaph:verified", onVerified as EventListener);

    const script = document.createElement("script");
    script.src = `/api/v1/widget.js?home-demo=${Date.now()}`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      container.removeEventListener("astracaph:verified", onVerified as EventListener);
      script.remove();
    };
  }, []);

  return (
    <div className="mt-6 rounded-[24px] border border-line bg-night/85 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-coral">
        {copy.demoLabel}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {copy.demoTitle}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.demoBody}</p>

      <div className="mt-5 rounded-[24px] border border-line bg-[radial-gradient(circle_at_top,rgba(78,167,255,0.12),transparent_36%),linear-gradient(180deg,#0b1422_0%,#08101a_100%)] p-5">
        <div className="flex justify-center">
          <div
            ref={containerRef}
            data-astracaph-container=""
            className="min-h-[148px] w-full max-w-[360px]"
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-panel/65 px-4 py-4 text-sm text-steel">
        {copy.demoTokenLabel}
        <div className="mt-2 break-all font-mono text-xs leading-6 text-white">
          {token || copy.demoTokenEmpty}
        </div>
      </div>

      <p className="mt-4 text-xs leading-6 text-steel/80">{copy.demoFootnote}</p>
    </div>
  );
}
