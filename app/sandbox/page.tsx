import { headers } from "next/headers";
import { SandboxLab } from "@/components/sandbox-lab";
import { SiteShell } from "@/components/site-shell";
import { getDictionary, resolveLocale } from "@/lib/i18n";

export default async function SandboxPage() {
  const locale = resolveLocale((await headers()).get("accept-language"));
  const dictionary = getDictionary(locale);

  return (
    <SiteShell
      locale={locale}
      eyebrow={dictionary.sandbox.eyebrow}
      title={dictionary.sandbox.title}
      subtitle={dictionary.sandbox.subtitle}
    >
      <SandboxLab locale={locale} />
    </SiteShell>
  );
}
