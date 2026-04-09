export const widgetSource = String.raw`(() => {
  const script = document.currentScript || Array.from(document.scripts).find((item) => /\/api\/v1\/widget\.js/.test(item.src));
  const apiOrigin = script ? new URL(script.src).origin : "https://caph.astracat.ru";
  const defaultSiteKey = 'pk_open_astracaph_public';
  const selectors = ['#astracaph-container', '[data-astracaph-container]'];
  const translations = {
    ru: {
      brand: 'ASTRACAPH',
      passive: 'Protect by ASTRACAPH',
      analyzingTitle: 'Анализ поведения',
      analyzingBody: 'Проверяем устройство, поведение и риск-сигналы',
      confirmingTitle: 'Подтверждаем присутствие',
      confirmingBody: 'Нужен короткий повторный шаг подтверждения',
      visualTitle: 'Нужен ещё один шаг',
      visualBody: 'Пассивной проверки оказалось недостаточно. Подтвердите действие.',
      visualButton: 'Подтвердить',
      holdTitle: 'Удерживайте подтверждение',
      holdBody: 'Для этой сети нужно более длинное физическое подтверждение.',
      holdButton: 'Нажмите и удерживайте',
      holdProgress: 'Удерживайте',
      holdRetry: 'Подтверждение было слишком коротким. Попробуйте ещё раз.',
      verifiedTitle: 'Проверка пройдена',
      verifiedBody: 'Токен выдан и готов к отправке.',
      failedTitle: 'Проверка не пройдена',
      failedBody: 'Risk engine отклонил эту сессию',
      unexpectedTitle: 'Неожиданный ответ',
      unexpectedBody: 'Сервис не выдал токен',
      networkTitle: 'Проблема сети',
      networkBody: 'Не удалось связаться с AstraCaph Edge API'
    },
    en: {
      brand: 'ASTRACAPH',
      passive: 'Protect by ASTRACAPH',
      analyzingTitle: 'Analyzing behavior',
      analyzingBody: 'Checking device posture, behavior, and risk signals',
      confirmingTitle: 'Confirming presence',
      confirmingBody: 'A short confirmation step is required',
      visualTitle: 'One last step',
      visualBody: 'Passive checks were inconclusive. Confirm the action to continue.',
      visualButton: 'Confirm',
      holdTitle: 'Press and hold to confirm',
      holdBody: 'This network requires a longer physical confirmation step.',
      holdButton: 'Press and hold',
      holdProgress: 'Holding',
      holdRetry: 'Physical confirmation was too short. Please try again.',
      verifiedTitle: 'Verified',
      verifiedBody: 'Token issued and ready for submission.',
      failedTitle: 'Verification failed',
      failedBody: 'Risk engine rejected the session',
      unexpectedTitle: 'Unexpected response',
      unexpectedBody: 'Token was not issued by the verification service',
      networkTitle: 'Network issue',
      networkBody: 'Unable to reach AstraCaph Edge API'
    }
  };

  function getLocale() {
    const values = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || 'en'];

    return values.some((value) => String(value).toLowerCase().startsWith('ru')) ? 'ru' : 'en';
  }

  const t = translations[getLocale()] || translations.en;

  function hashCanvas() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 220;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#58d7c4';
      ctx.font = '16px sans-serif';
      ctx.fillText('AstraCaph', 12, 26);
      ctx.strokeStyle = '#ff7452';
      ctx.beginPath();
      ctx.arc(170, 28, 18, 0, Math.PI * 1.4);
      ctx.stroke();
      return canvas.toDataURL().slice(-80);
    } catch {
      return '';
    }
  }

  function getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { vendor: '', renderer: '' };
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return { vendor: '', renderer: '' };
      return {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '',
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
      };
    } catch {
      return { vendor: '', renderer: '' };
    }
  }

  function createStyles() {
    return \`
      :host {
        all: initial;
        color-scheme: dark;
      }
      .card {
        box-sizing: border-box;
        width: min(100%, 340px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background:
          radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 32%),
          linear-gradient(180deg, #050505 0%, #020202 100%);
        color: #f5f5f5;
        padding: 16px;
        font-family: "Segoe UI", Arial, sans-serif;
        box-shadow: 0 28px 90px rgba(0, 0, 0, 0.72);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .brand {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: linear-gradient(180deg, #0a0a0a 0%, #040404 100%);
        display: grid;
        place-items: center;
        color: #ffffff;
        flex: none;
      }
      .brand svg {
        width: 18px;
        height: 18px;
      }
      .title {
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
        margin: 0;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .muted {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.52);
        margin: 4px 0 0;
      }
      .status {
        margin-top: 14px;
        padding: 14px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: linear-gradient(180deg, #0a0a0a 0%, #060606 100%);
      }
      .ring {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.12);
        border-top-color: #ffffff;
        animation: spin 0.9s linear infinite;
        flex: none;
      }
      .success {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: #111111;
        display: grid;
        place-items: center;
        color: #ffffff;
        font-weight: 800;
        font-size: 12px;
      }
      .error {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: #111111;
        position: relative;
      }
      .error::before,
      .error::after {
        content: "";
        position: absolute;
        top: 8px;
        left: 3px;
        width: 10px;
        height: 1px;
        background: rgba(255, 255, 255, 0.92);
      }
      .error::before {
        transform: rotate(45deg);
      }
      .error::after {
        transform: rotate(-45deg);
      }
      .button {
        margin-top: 12px;
        width: 100%;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        padding: 11px 14px;
        font: inherit;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        background: #0b0b0b;
        color: #ffffff;
      }
      .button[data-holding="true"] {
        background: linear-gradient(90deg, #ffffff 0%, #b9b9b9 100%);
        color: #050505;
      }
      .button:disabled {
        opacity: 0.7;
        cursor: wait;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    \`;
  }

  function createFingerprint() {
    const gl = getWebGLInfo();
    return {
      userAgent: navigator.userAgent || '',
      language: navigator.language || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      platform: navigator.platform || '',
      webdriver: Boolean(navigator.webdriver),
      canvas: hashCanvas(),
      webglVendor: gl.vendor,
      webglRenderer: gl.renderer,
      screen: {
        width: window.screen.width || 0,
        height: window.screen.height || 0,
        pixelRatio: window.devicePixelRatio || 1
      },
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory
    };
  }

  function initContainer(container) {
    const siteKey = container.getAttribute('data-sitekey') || defaultSiteKey;

    const root = container.shadowRoot || container.attachShadow({ mode: 'open' });
    const state = {
      startedAt: Date.now(),
      motion: [],
      keyPresses: 0,
      clickCount: 0,
      focusChanges: 0,
      pointerMoves: 0,
      challengeId: null,
      challengeType: 'confirm',
      requiredHoldMs: 0,
      holdStartedAt: 0
    };

    const style = document.createElement('style');
    style.textContent = createStyles();

    const shell = document.createElement('div');
    shell.className = 'card';
    shell.innerHTML = \`
      <div class="row">
        <div class="brand" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3 18 5.5v5.2c0 4.2-2.4 7.2-6 9.3-3.6-2.1-6-5.1-6-9.3V5.5L12 3Z"></path>
            <path d="m9.5 12 1.7 1.7 3.6-3.9"></path>
          </svg>
        </div>
        <div>
          <p class="title">\${t.brand}</p>
          <p class="muted">\${t.passive}</p>
        </div>
      </div>
      <div class="status" data-status>
        <div class="row">
          <div class="ring"></div>
          <div>
            <p class="title" style="margin:0;">\${t.analyzingTitle}</p>
            <p class="muted" style="margin:4px 0 0;">\${t.analyzingBody}</p>
          </div>
        </div>
      </div>
    \`;

    root.innerHTML = '';
    root.append(style, shell);

    const statusNode = shell.querySelector('[data-status]');

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'astracaph-response';
    const form = container.closest('form');
    (form || container).appendChild(hiddenInput);

    function updateStatus(kind, title, description, buttonLabel, buttonMode) {
      if (!statusNode) return;
      let icon = '<div class="ring"></div>';
      if (kind === 'success') icon = '<div class="success">✓</div>';
      if (kind === 'error') icon = '<div class="error"></div>';
      statusNode.innerHTML = \`
        <div class="row">
          \${icon}
          <div>
            <p class="title" style="margin:0;">\${title}</p>
            <p class="muted" style="margin:4px 0 0;">\${description}</p>
          </div>
        </div>
      \`;
      if (buttonLabel) {
        const button = document.createElement('button');
        button.className = 'button';
        button.type = 'button';
        button.textContent = buttonLabel;
        if (buttonMode === 'press_hold') {
          let released = false;

          const reset = () => {
            released = true;
            state.holdStartedAt = 0;
            button.dataset.holding = 'false';
            button.textContent = buttonLabel;
          };

          const finish = () => {
            const holdDurationMs = Date.now() - state.holdStartedAt;
            released = true;
            button.dataset.holding = 'false';
            button.textContent = buttonLabel;
            void runChallenge(true, button, holdDurationMs);
          };

          button.addEventListener('pointerdown', () => {
            released = false;
            state.holdStartedAt = Date.now();
            button.dataset.holding = 'true';
            button.textContent = t.holdProgress + ' ' + Math.ceil((state.requiredHoldMs || 0) / 1000) + 's';
            window.setTimeout(() => {
              if (!released && state.holdStartedAt > 0) {
                finish();
              }
            }, state.requiredHoldMs || 0);
          });

          button.addEventListener('pointerup', reset);
          button.addEventListener('pointerleave', reset);
          button.addEventListener('pointercancel', reset);
        } else {
          button.addEventListener('click', () => runChallenge(true, button, 0));
        }
        statusNode.appendChild(button);
      }
    }

    function onPointerMove(event) {
      state.pointerMoves += 1;
      if (state.motion.length > 48) return;
      state.motion.push({
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
        t: Date.now() - state.startedAt
      });
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('keydown', () => { state.keyPresses += 1; }, { passive: true });
    window.addEventListener('focus', () => { state.focusChanges += 1; }, { passive: true });
    container.addEventListener('click', () => { state.clickCount += 1; }, { passive: true });

    async function runChallenge(isVisual, button, holdDurationMs) {
      if (button) button.disabled = true;
      if (isVisual) {
        updateStatus('loading', t.confirmingTitle, t.confirmingBody);
      }

      const payload = {
        siteKey,
        fingerprint: createFingerprint(),
        motion: state.motion,
        page: window.location.pathname,
        referrer: document.referrer || '',
        behavior: {
          dwellMs: Date.now() - state.startedAt,
          keyPresses: state.keyPresses,
          pointerMoves: state.pointerMoves,
          focusChanges: state.focusChanges,
          clickCount: state.clickCount,
          submitLatencyMs: Date.now() - state.startedAt
        },
        interaction: isVisual
          ? {
              confirmed: true,
              challengeId: state.challengeId,
              holdDurationMs: holdDurationMs || 0
            }
          : undefined
      };

      try {
        const response = await fetch(apiOrigin + '/api/v1/challenge', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          updateStatus('error', t.failedTitle, t.failedBody);
          return;
        }

        if (data.needsVisual && data.challengeId) {
          state.challengeId = data.challengeId;
          state.challengeType = data.challengeType || 'confirm';
          state.requiredHoldMs = data.requiredHoldMs || 0;
          if (state.challengeType === 'press_hold') {
            updateStatus(
              'visual',
              t.holdTitle,
              data.error || t.holdBody,
              t.holdButton,
              'press_hold'
            );
          } else {
            updateStatus('visual', t.visualTitle, t.visualBody, t.visualButton, 'confirm');
          }
          return;
        }

        if (data.token) {
          hiddenInput.value = data.token;
          updateStatus('success', t.verifiedTitle, t.verifiedBody);
          container.dispatchEvent(new CustomEvent('astracaph:verified', { detail: data }));
          return;
        }

        updateStatus('error', t.unexpectedTitle, t.unexpectedBody);
      } catch (error) {
        updateStatus('error', t.networkTitle, t.networkBody);
      }
    }

    const start = () => runChallenge(false);
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(start, { timeout: 800 });
    } else {
      window.setTimeout(start, 600);
    }
  }

  function boot() {
    const nodes = selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
    nodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.dataset.astracaphMounted === 'true') return;
      node.dataset.astracaphMounted = 'true';
      initContainer(node);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})()`
  .replace(/\\`/g, "`")
  .replace(/\\\$\{/g, "${");
