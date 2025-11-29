
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
            From your backend, you must make a server-to-server request to the CAPTCHA API to verify the token you received from the frontend.
            This is a critical security step. Your <Code>secretKey</Code> must never be exposed on the client-side.
          </P>
          <P>
            Here are examples of how to implement the backend verification logic in Node.js and Python:
          </P>

          <h4>Node.js (with Express) Example</h4>
          <Code>
            {`
// On your backend server (e.g., in an Express route)
app.post("/your-backend-endpoint", async (req, res) => {
  const { token } = req.body;
  const secretKey = process.env.CAPTCHA_SECRET_KEY; // Store your secret key securely!

  try {
    const response = await fetch(\`\${process.env.NEXT_PUBLIC_APP_URL || 'https://astracaph.vercel.app'}/public/api/v1/verify\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, secretKey }),
    });

    const data = await response.json();

    if (data.success) {
      // CAPTCHA verification successful. Proceed with your form submission logic.
      res.status(200).json({ message: "CAPTCHA verified successfully." });
    } else {
      // CAPTCHA verification failed.
      res.status(400).json({ message: "CAPTCHA verification failed." });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});
            `}
          </Code>

          <h4>Python (with Flask) Example</h4>
          <Code>
            {`
# On your backend server (e.g., in a Flask route)
import os
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/your-backend-endpoint', methods=['POST'])
def verify_captcha():
    token = request.json.get('token')
    secret_key = os.environ.get('CAPTCHA_SECRET_KEY') # Store your secret key securely!

    captcha_verify_url = f"{os.environ.get('NEXT_PUBLIC_APP_URL', 'https://astracaph.vercel.app')}/public/api/v1/verify"

    try:
        response = requests.post(
            captcha_verify_url,
            json={'token': token, 'secretKey': secret_key}
        )
        response.raise_for_status()
        data = response.json()

        if data.get('success'):
            # CAPTCHA verification successful. Proceed with your form submission logic.
            return jsonify({'message': 'CAPTCHA verified successfully.'}), 200
        else:
            # CAPTCHA verification failed.
            return jsonify({'message': 'CAPTCHA verification failed.'}), 400

    except requests.exceptions.RequestException as e:
        return jsonify({'message': 'Internal server error.'}), 500
            `}
          </Code>

          <h4>Example Response</h4>
          <P>A successful verification will return a JSON object like this:</P>
          <Code>
            {`
{
  "success": true,
  "message": "Verification successful"
}
            `}
          </Code>
        </CardContent>
      </Card>
    </div>
  );
}
