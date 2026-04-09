import Link from "next/link";
import { ReactNode } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

export function SiteShell({
  children,
  eyebrow,
  title,
  subtitle,
  locale,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  locale: Locale;
}) {
  const dictionary = getDictionary(locale);
  const navItems = [
    { href: "/", label: dictionary.nav.overview },
    { href: "/help", label: dictionary.nav.help },
    { href: "/dashboard", label: dictionary.nav.dashboard },
    { href: "/sandbox", label: dictionary.nav.sandbox },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-mist text-ink">
      <div className="absolute inset-0 -z-10 bg-grid bg-[size:34px_34px] opacity-40" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(78,167,255,0.28),transparent_30%),radial-gradient(circle_at_top_right,rgba(27,75,140,0.32),transparent_35%),linear-gradient(180deg,rgba(8,16,26,0.72),transparent_75%)]" />
      <div className="absolute inset-x-0 top-24 -z-10 h-72 bg-[radial-gradient(circle,rgba(59,130,246,0.14),transparent_60%)] blur-3xl" />
      <div className="mx-auto max-w-6xl px-6 py-6 sm:px-8">
        <header className="mb-12 animate-floatup rounded-[28px] border border-line bg-panel/86 px-5 py-4 shadow-panel backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-coral to-gold text-lg font-black text-white">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.22)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3 18 5.5v5.2c0 4.2-2.4 7.2-6 9.3-3.6-2.1-6-5.1-6-9.3V5.5L12 3Z" />
                  <path d="m9.5 12 1.7 1.7 3.6-3.9" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-steel/80">
                  AstraCaph
                </p>
                <p className="text-xl font-semibold tracking-tight text-white">
                  {dictionary.shell.tagline}
                </p>
              </div>
            </Link>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-line bg-white/[0.02] px-4 py-2 text-sm font-medium text-steel transition hover:border-coral/50 hover:bg-coral/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <section className="mb-10 animate-floatup">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-coral">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-steel sm:text-lg">
            {subtitle}
          </p>
        </section>

        {children}
      </div>
    </div>
  );
}
