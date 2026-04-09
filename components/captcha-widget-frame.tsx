"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifiedDetail = {
  token?: string;
};

function resolveTheme(value: string | null): "dark" | "light" {
  return value === "light" ? "light" : "dark";
}

export function CaptchaWidgetFrame() {
  const searchParams = useSearchParams();
  const siteKey = searchParams.get("siteKey") || "pk_demo_astracat_captcha_public";
  const theme = resolveTheme(searchParams.get("theme"));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.setAttribute("data-sitekey", siteKey);

    function onVerified(event: Event) {
      const detail = (event as CustomEvent<VerifiedDetail>).detail;
      const nextToken = detail?.token ?? "";
      setToken(nextToken);
      window.parent?.postMessage(
        {
          type: "astracaph-verified",
          detail: {
            token: nextToken,
            success: Boolean(nextToken),
            siteKey,
          },
        },
        "*",
      );
    }

    container.addEventListener("astracaph:verified", onVerified as EventListener);
    return () => {
      container.removeEventListener("astracaph:verified", onVerified as EventListener);
    };
  }, [siteKey]);

  const isLight = theme === "light";

  return (
    <main
      className={`min-h-screen p-4 ${
        isLight
          ? "bg-[#f5f7fb] text-[#0b1220]"
          : "bg-[linear-gradient(180deg,#030303_0%,#090909_100%)] text-white"
      }`}
    >
      <Script src="/api/v1/widget.js" strategy="afterInteractive" />

      <div
        className={`mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[350px] flex-col justify-center rounded-[28px] border p-4 ${
          isLight
            ? "border-black/10 bg-white shadow-[0_24px_70px_rgba(11,18,32,0.12)]"
            : "border-white/10 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.65)]"
        }`}
      >
        <div
          ref={containerRef}
          data-astracaph-container=""
          data-sitekey={siteKey}
          className="mx-auto min-h-[144px] w-full max-w-[340px]"
        />

        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-xs leading-6 ${
            isLight
              ? "border-black/10 bg-[#f7f8fb] text-[#42516a]"
              : "border-white/10 bg-[#050505] text-white/50"
          }`}
        >
          <div className="font-semibold uppercase tracking-[0.18em]">
            Protect by ASTRACAPH
          </div>
          <div className="mt-2 break-all font-mono">
            {token || "Waiting for verification token..."}
          </div>
        </div>
      </div>
    </main>
  );
}
