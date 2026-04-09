import Link from "next/link";
import { headers } from "next/headers";
import { HomeCaptchaDemo } from "@/components/home-captcha-demo";
import { SiteShell } from "@/components/site-shell";
import { getDictionary, resolveLocale } from "@/lib/i18n";

export default async function HomePage() {
  const locale = resolveLocale((await headers()).get("accept-language"));
  const dictionary = getDictionary(locale);

  return (
    <SiteShell
      locale={locale}
      eyebrow={dictionary.home.eyebrow}
      title={dictionary.home.title}
      subtitle={dictionary.home.subtitle}
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-line bg-panel/88 p-7 shadow-panel backdrop-blur-xl">
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-steel/80">
            <span>Widget</span>
            <span>Edge</span>
            <span>Redis</span>
            <span>Tailwind</span>
          </div>
          <HomeCaptchaDemo locale={locale} />
          <div className="mt-6 overflow-hidden rounded-[24px] border border-line bg-night p-5 text-sm text-white">
            <pre className="overflow-x-auto whitespace-pre-wrap">
{`<script src="https://caph.astracat.ru/api/v1/widget.js" async defer></script>
<div id="astracaph-container" data-sitekey="public_key"></div>`}
            </pre>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/help"
              className="rounded-full border border-coral/30 bg-coral/14 px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral/22"
            >
              {dictionary.home.guide}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-steel transition hover:border-coral/40 hover:bg-coral/12 hover:text-white"
            >
              {dictionary.home.dashboard}
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {dictionary.home.features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-line bg-night/80 px-4 py-4 text-sm leading-6 text-steel"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {dictionary.home.pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="rounded-[28px] border border-line bg-panel/88 p-6 shadow-panel backdrop-blur-xl"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-coral to-gold text-sm font-black text-white">
                  0{index + 1}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">{pillar.title}</h2>
              </div>
              <p className="text-sm leading-7 text-steel">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
