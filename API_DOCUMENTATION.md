# AstraCaph API Documentation

Welcome to the AstraCaph API documentation. This guide will help you integrate and use the AstraCaph service on your website.

## Integration Guide

Integrating the AstraCaph widget into your website is a two-step process.

### Step 1: Frontend Integration

Embed the following HTML snippet into your web page where you want the CAPTCHA widget to appear:

```html
<iframe
  src="https://astracaph.vercel.app/captcha/widget?siteKey=pk_demo_astracat_captcha_public&theme=dark"
  width="350"
  height="500"
  frameborder="0"
  scrolling="no"
></iframe>
```

You can customize the widget's appearance by changing the `theme` parameter in the `src` URL. The available options are `dark` (default) and `light`.

After a user successfully completes the CAPTCHA challenge, the widget will send a message to the parent window containing a verification token. You will need to add a JavaScript event listener to your page to receive this token and send it to your backend.

Here's an example of how to listen for the message and send the token to your server:

```javascript
window.addEventListener("message", (event) => {
  // Ensure the message is from the AstraCaph widget
  if (event.origin !== "https://astracaph.vercel.app") {
    return;
  }

  const { token, success } = event.data;

  if (success) {
    // Send the token to your backend for verification
    fetch("/your-backend-endpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ captchaToken: token }),
    });
  }
});
```

### Step 2: Backend Verification

From your backend, you must make a server-to-server request to the AstraCaph API to verify the token you received from the frontend.

## API Endpoints

### POST /public/api/v1/verify

This endpoint is used to verify a CAPTCHA challenge that has been completed by a user. **This endpoint should be called from your server-side code, not from the client.**

#### Request Body

| Parameter      | Type   | Description                                                  |
| :------------- | :----- | :----------------------------------------------------------- |
| `token`        | string | **Required.** The token received from a successful challenge. |
| `secretKey`    | string | **Required.** The secret key associated with your site key.   |

#### Example cURL Request

```bash
curl -X POST https://astracaph.vercel.app/public/api/v1/verify \
-H "Content-Type: application/json" \
-d '{
  "token": "the_token_from_the_frontend",
  "secretKey": "your_secret_key"
}'
```

#### Example Response

```json
{
  "success": true,
  "score": 85,
  "bot": false,
  "details": {
    "reasons": [],
    "timestamp": 1678886400000
  }
}
```
