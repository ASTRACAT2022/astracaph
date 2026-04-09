import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import "@/app/globals.css";
import { resolveLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "AstraCaph",
  description:
    "Traffic verification and protection platform with passive telemetry, signed tokens, and one-line widget integration.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = resolveLocale((await headers()).get("accept-language"));

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
