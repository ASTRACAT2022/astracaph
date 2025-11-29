import { NextResponse } from "next/server"

export async function GET() {
  const docs = {
    name: "AstraCaph API",
    version: "1.0.0",
    description: "Modern CAPTCHA system without external dependencies",
    endpoints: {
      token: {
        method: "POST",
        path: "/api/v1/token",
        description: "Generate a new CAPTCHA challenge",
        body: {
          siteKey: "string (required) - Your public site key",
        },
        response: {
          success: "boolean",
          challenge: {
            token: "string - Unique challenge token",
            type: "string - Challenge type (drag/puzzle/fallback)",
            data: "object - Challenge-specific data",
            expiresAt: "number - Expiration timestamp",
          },
          canvasChallenge: "string - Canvas fingerprint challenge",
        },
      },
      verify: {
        method: "POST",
        path: "/api/v1/verify",
        description: "Verify a completed CAPTCHA challenge",
        body: {
          token: "string (required) - Challenge token",
          secretKey: "string (required) - Your secret key",
          userResponse: {
            interactionTime: "number - Time to complete in ms",
            mouseMovements: "number - Mouse movement count",
            timings: "number[] - Event timestamps",
            canvasFingerprint: "string - Canvas fingerprint",
            webglFingerprint: "string - WebGL fingerprint",
          },
        },
        response: {
          success: "boolean - Verification result",
          score: "number - Human-likeness score (0-100)",
          bot: "boolean - Bot detection result",
          details: {
            reasons: "string[] - Failure reasons if any",
            timestamp: "number",
          },
        },
      },
      health: {
        method: "GET",
        path: "/api/v1/health",
        description: "Check API health and statistics",
        response: {
          status: "string - healthy/unhealthy",
          version: "string",
          uptime: "number",
          statistics: "object",
        },
      },
      challenge: {
        method: "GET",
        path: "/api/v1/challenge?token=xxx",
        description: "Check challenge status",
        response: {
          success: "boolean",
          expiresAt: "number",
          attempts: "number",
        },
      },
    },
    integration: {
      html: `<div id="astra-captcha"></div>
<script src="/captcha.js"></script>
<script>
  const captcha = new AstraCaptcha({
    siteKey: 'your-site-key',
    theme: 'dark',
    onSuccess: (token) => {
      console.log('Verified:', token);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  });
  captcha.render('astra-captcha');
</script>`,
      react: `import { AstraCaptchaWidget } from '@/components/captcha/astra-captcha-widget';

function MyForm() {
  const handleVerify = (token, success) => {
    if (success) {
      console.log('Verified:', token);
      // Submit form
    }
  };

  return (
    <AstraCaptchaWidget
      siteKey="your-site-key"
      onVerify={handleVerify}
      theme="dark"
    />
  );
}`,
      iframe: `<div id="captcha-container"></div>
<script>
  const iframe = document.createElement('iframe');
  iframe.src = '/captcha/widget?siteKey=your-site-key&theme=dark';
  iframe.style.width = '100%';
  iframe.style.height = '280px';
  iframe.style.border = 'none';
  document.getElementById('captcha-container').appendChild(iframe);
</script>`,
    },
  }

  return NextResponse.json(docs, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

export const runtime = "edge"
