import { headers } from "next/headers";
import { SiteDomainRemovalPanel } from "@/components/site-domain-removal-panel";
import { SiteRegistrationPanel } from "@/components/site-registration-panel";
import { SiteShell } from "@/components/site-shell";
import { getDictionary, resolveLocale } from "@/lib/i18n";

export default async function DashboardPage() {
  const locale = resolveLocale((await headers()).get("accept-language"));
  const dictionary = getDictionary(locale);

  return (
    <SiteShell
      locale={locale}
      eyebrow={dictionary.dashboard.eyebrow}
      title={dictionary.dashboard.title}
      subtitle={dictionary.dashboard.subtitle}
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SiteRegistrationPanel locale={locale} />
        <section className="rounded-[30px] border border-line bg-panel/88 p-7 shadow-panel backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-coral">
            {dictionary.dashboard.howItWorks}
          </p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-steel">
            {dictionary.dashboard.notes.map((item) => (
              <p key={item} className="rounded-2xl border border-line bg-night/80 px-4 py-4">
                {item}
              </p>
            ))}
          </div>
        </section>
        <div className="lg:col-span-2">
          <SiteDomainRemovalPanel locale={locale} />
        </div>
      </div>
    </SiteShell>
  );
}
