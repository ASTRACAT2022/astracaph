import { NextResponse } from "next/server";

export async function GET() {
  const script = `
(function() {
  const scriptTag = document.currentScript;
  const siteKey = scriptTag.getAttribute('data-sitekey');
  const theme = scriptTag.getAttribute('data-theme') || 'dark';
  const containerId = 'astracaph-widget';
  const container = document.getElementById(containerId);

  if (!container) {
    console.error('AstraCaph Error: Container with id "' + containerId + '" not found.');
    return;
  }

  if (!siteKey) {
    console.error('AstraCaph Error: "data-sitekey" attribute is missing.');
    return;
  }

  const iframe = document.createElement('iframe');
  const origin = new URL(scriptTag.src).origin;
  const iframeSrc = origin + '/captcha/widget?siteKey=' + encodeURIComponent(siteKey) + '&theme=' + encodeURIComponent(theme);

  iframe.src = iframeSrc;
  iframe.style.width = '100%';
  iframe.style.maxWidth = '400px';
  iframe.style.height = '480px';
  iframe.style.border = 'none';
  iframe.style.overflow = 'hidden';
  iframe.setAttribute('title', 'AstraCaph Security Verification');

  // Clear the container and append the iframe
  container.innerHTML = '';
  container.appendChild(iframe);

  // Optional: Listen for messages from the iframe (e.g., onVerify)
  window.addEventListener('message', function(event) {
    if (event.origin !== origin) {
      return;
    }

    if (event.data && event.data.type === 'astracaph-verified') {
      // You can dispatch a custom event for your application to listen to
      const customEvent = new CustomEvent('astracaph-verified', { detail: event.data.detail });
      document.dispatchEvent(customEvent);
      console.log('AstraCaph verification result:', event.data.detail);
    }
  });
})();
  `;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
    },
  });
}
