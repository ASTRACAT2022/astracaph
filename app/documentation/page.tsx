
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, H1, H2, H3, P } from "@/components/ui/typography";

export default function DocumentationPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <H1>API Documentation</H1>

      <P>
        Welcome to the CAPTCHA API documentation. This guide will help you
        integrate and use the CAPTCHA service on your website.
      </P>

      <Card>
        <CardHeader>
          <CardTitle>
            <H2>Integration Guide</H2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <P>
            Integrating the CAPTCHA widget into your website is a two-step
            process.
          </P>

          <H3>Step 1: Frontend Integration</H3>
          <P>
            Embed the following HTML snippet into your web page where you want
            the CAPTCHA widget to appear:
          </P>
          <Code>
            {`
<iframe
  src={\`\${process.env.NEXT_PUBLIC_APP_URL || 'https://astracaph.vercel.app'}/captcha/widget?siteKey=pk_demo_astracat_captcha_public&theme=dark\`}
  width="350"
  height="500"
  frameborder="0"
  scrolling="no"
></iframe>
            `}
          </Code>
          <P>
            You can customize the widget's appearance by changing the{" "}
            <Code>theme</Code> parameter in the <Code>src</Code> URL. The
            available options are <Code>dark</Code> (default) and{" "}
            <Code>light</Code>.
          </P>
          <P>
            After a user successfully completes the CAPTCHA challenge, the
            widget will send a message to the parent window containing a
            verification token. You will need to add a JavaScript event
            listener to your page to receive this token and send it to your
            backend.
          </P>
          <P>
            Here's an example of how to listen for the message and send the
            token to your server:
          </P>
          <Code>
            {`
window.addEventListener("message", (event) => {
  // Ensure the message is from the CAPTCHA widget
  if (event.origin !== (process.env.NEXT_PUBLIC_APP_URL || "https://astracaph.vercel.app")) {
    return;
  }

  if (event.data.type === 'astracaph-verified') {
    const { token, success } = event.data.detail;
    if (success) {
      // Send the token to your backend for verification
      fetch("/your-backend-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token }),
      });
    }
  }
});
            `}
          </Code>

          <H3>Step 2: Backend Verification</H3>
          <P>
            From your backend, you must make a server-to-server request to the
            CAPTCHA API to verify the token you received from the frontend.
          </P>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <H2>API Endpoints</H2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <H3>POST /public/api/v1/verify</H3>
          <P>
            This endpoint is used to verify a CAPTCHA challenge that has been
            completed by a user.{" "}
            <strong>
              This endpoint should be called from your server-side code, not
              from the client.
            </strong>
          </P>

          <h4>Request Body</h4>
          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Code>token</Code>
                </td>
                <td>
                  <Code>string</Code>
                </td>
                <td>
                  <strong>Required.</strong> The token received from a
                  successful challenge.
                </td>
              </tr>
              <tr>
                <td>
                  <Code>secretKey</Code>
                </td>
                <td>
                  <Code>string</Code>
                </td>
                <td>
                  <strong>Required.</strong> The secret key associated with your
                  site key.
                </td>
              </tr>
              <tr>
                <td>
                  <Code>userResponse</Code>
                </td>
                <td>
                  <Code>object</Code>
                </td>
                <td>
                  <strong>Required.</strong> An object containing user
                  interaction data.
                </td>
              </tr>
            </tbody>
          </table>

          <h4>Example cURL Request</h4>
          <Code>
            {`
curl -X POST \${process.env.NEXT_PUBLIC_APP_URL || 'https://astracaph.vercel.app'}/public/api/v1/verify \\
-H "Content-Type: application/json" \\
-d '{
  "token": "the_token_from_the_frontend",
  "secretKey": "your_secret_key",
  "userResponse": {
    "interactionTime": 1000,
    "mouseMovements": 10,
    "timings": [100, 200, 300],
    "canvasFingerprint": "fingerprint",
    "webglFingerprint": "fingerprint"
  }
}'
            `}
          </Code>

          <h4>Example Response</h4>
          <Code>
            {`
{
  "success": true,
  "score": 85,
  "bot": false,
  "details": {
    "reasons": [],
    "timestamp": 1678886400000
  }
}
            `}
          </Code>
        </CardContent>
      </Card>
    </div>
  );
}
