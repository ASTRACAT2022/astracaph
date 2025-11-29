import { NextResponse } from "next/server";

export async function POST() {
  // For the current in-memory, ephemeral storage model, we cannot reliably
  // create new site keys on-the-fly, as they will not be persisted across
  // serverless function invocations.
  // Instead, we will consistently return the hardcoded demo key, which is
  // guaranteed to exist in the captchaStorage singleton.
  // A proper implementation would require a persistent database.

  const demoSiteKey = "pk_demo_astracat_captcha_public";
  const demoSecretKey = "sk_demo_astracat_captcha_secret"; // This is the corresponding secret

  return NextResponse.json(
    {
      siteKey: demoSiteKey,
      secretKey: demoSecretKey,
    },
    { status: 200 } // Status 200 OK, as we are retrieving an existing key
  );
}
