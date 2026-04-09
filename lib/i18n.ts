export type Locale = "ru" | "en";

type Dictionary = {
  nav: {
    overview: string;
    help: string;
    dashboard: string;
    sandbox: string;
  };
  shell: {
    tagline: string;
  };
  home: {
    eyebrow: string;
    title: string;
    subtitle: string;
    guide: string;
    dashboard: string;
    demoLabel: string;
    demoTitle: string;
    demoBody: string;
    demoTokenLabel: string;
    demoTokenEmpty: string;
    demoFootnote: string;
    features: string[];
    pillars: Array<{ title: string; body: string }>;
  };
  help: {
    eyebrow: string;
    title: string;
    subtitle: string;
    flowNotes: string;
    environment: string;
    steps: Array<{ title: string; snippet: string }>;
    apiNotes: string[];
  };
  dashboard: {
    eyebrow: string;
    title: string;
    subtitle: string;
    howItWorks: string;
    notes: string[];
  };
  registration: {
    section: string;
    title: string;
    subtitle: string;
    warning: string;
    domainLabel: string;
    domainPlaceholder: string;
    siteNameLabel: string;
    siteNamePlaceholder: string;
    submit: string;
    submitPending: string;
    issueError: string;
    issueNetworkError: string;
    successLead: string;
    successTail: string;
    publicKey: string;
    privateSecret: string;
    download: string;
    keepSecret: string;
    embed: string;
    verify: string;
    backupTitle: string;
    backupImportant: string;
    backupWarningOne: string;
    backupWarningTwo: string;
    backupSiteName: string;
    backupOrigin: string;
    backupPublicKey: string;
    backupPrivateSecret: string;
  };
  removal: {
    section: string;
    title: string;
    subtitle: string;
    domainLabel: string;
    domainPlaceholder: string;
    secretLabel: string;
    secretPlaceholder: string;
    submit: string;
    submitPending: string;
    deleteError: string;
    deleteNetworkError: string;
    removed: string;
  };
  sandbox: {
    eyebrow: string;
    title: string;
    subtitle: string;
    editorLabel: string;
    editorTitle: string;
    editorBody: string;
    editorHint: string;
    previewLabel: string;
    previewTitle: string;
    previewBody: string;
    previewHint: string;
    logsLabel: string;
    logsTitle: string;
    logsBody: string;
    latestToken: string;
    noToken: string;
    previewEvents: string;
    waitingEvents: string;
    verifyAction: string;
    verifyingAction: string;
    verifyEmpty: string;
    verifyFailed: string;
    verifyPlaceholder: string;
    demoPair: string;
    noLogs: string;
    missingContainer: string;
    verifiedCaptured: string;
    submitCaptured: string;
    templateName: string;
    templateNamePlaceholder: string;
    templateEmail: string;
    templateEmailPlaceholder: string;
    templateButton: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    nav: {
      overview: "Обзор",
      help: "Документация",
      dashboard: "Ключи",
      sandbox: "Sandbox",
    },
    shell: {
      tagline: "Платформа верификации и защиты трафика",
    },
    home: {
      eyebrow: "Защита для людей",
      title: "Лёгкая капча, которая работает как risk engine, а не как лишний барьер.",
      subtitle:
        "AstraCaph сначала старается не мешать реальным пользователям: пассивно собирает телеметрию, мягко повышает проверку только если риск неочевиден и выдаёт подписанный результат для вашего бэкенда.",
      guide: "Открыть гайд",
      dashboard: "Управление ключами",
      demoLabel: "Живой пример",
      demoTitle: "Так капча выглядит на реальной странице",
      demoBody:
        "Ниже встроен настоящий AstraCaph widget в открытом режиме. Можно увидеть реальный интерфейс проверки и токен, который выдаётся после успешного прохождения.",
      demoTokenLabel: "Выданный токен:",
      demoTokenEmpty: "Токен появится здесь после успешной проверки",
      demoFootnote:
        "Пример использует открытый профиль AstraCaph и показывает живой production-style UI виджета без обязательного frontend key.",
      features: [
        "Fingerprint: User-Agent, Canvas, WebGL, часовой пояс, параметры экрана",
        "Анализ движения: плавность траектории, jitter, смены направления, паузы",
        "Поведенческий скоринг: dwell time, click tempo, focus churn, key cadence",
        "IP intelligence: несколько бесплатных IP-баз для оценки hosting / residential / proxy / vpn",
        "Безопасность: HMAC JWT, rate limiting, allowlist IP для verify",
      ],
      pillars: [
        {
          title: "Пассивная проверка",
          body: "Виджет сначала оценивает движения мыши, профиль браузера и тайминги взаимодействия. Активная проверка включается только если сессия выглядит сомнительно.",
        },
        {
          title: "Минимальная задержка",
          body: "Challenge и verify-эндпоинты рассчитаны на Vercel Edge: короткий TTFB, одноразовые подписанные токены и лёгкий пайплайн запросов.",
        },
        {
          title: "Единый домен",
          body: "Лендинг, документация, выдача виджета и verification API живут на одном домене, что упрощает интеграцию и контроль origin.",
        },
        {
          title: "Открытая выдача ключей",
          body: "Базовая интеграция работает без frontend-ключа. При необходимости можно дополнительно выпустить секреты и жёстко привязать verify к конкретному origin сайта.",
        },
      ],
    },
    help: {
      eyebrow: "Документация",
      title: "Подключите один скрипт и проверяйте токен на своём бэкенде по origin или secret.",
      subtitle:
        "AstraCaph поддерживает открытый режим без обязательных frontend-ключей. Виджет можно встроить сразу, а сервер затем валидирует токен по вашему origin или по secret-ключу в более строгом сценарии.",
      flowNotes: "Поток работы",
      environment: "Рекомендуемые переменные",
      steps: [
        {
          title: "0. Определите origin сайта",
          snippet: `Пример: https://example.com

Этот origin будет передаваться вашим backend verify-запросом
в AstraCaph как ожидаемая привязка токена.`,
        },
        {
          title: "1. Подключите виджет",
          snippet: `<script src="https://caph.astracat.ru/api/v1/widget.js" async defer></script>
<div id="astracaph-container"></div>`,
        },
        {
          title: "2. Получите скрытый токен",
          snippet: `<input type="hidden" name="astracaph-response" value="eyJ..." />`,
        },
        {
          title: "3. Проверьте токен на бэкенде",
          snippet: `POST https://caph.astracat.ru/api/v1/verify
Content-Type: application/json

{
  "token": "user_generated_token",
  "origin": "https://example.com"
}`,
        },
        {
          title: "4. Опционально зарегистрируйте secret-привязку",
          snippet: `POST https://caph.astracat.ru/api/v1/sites
Content-Type: application/json

{
  "domain": "example.com",
  "name": "Example store"
}`,
        },
        {
          title: "5. Удалите привязанный домен",
          snippet: `DELETE https://caph.astracat.ru/api/v1/sites
Content-Type: application/json

{
  "domain": "example.com",
  "secret": "sk_live_..."
}`,
        },
      ],
      apiNotes: [
        "Базовый режим AstraCaph не требует frontend site key: достаточно подключить `/api/v1/widget.js` и контейнер `#astracaph-container`.",
        "POST /api/v1/verify умеет валидировать токен по `origin` или `domain`, поэтому Vercel deployment может работать без постоянной базы сайтов.",
        "POST /api/v1/sites создаёт бесплатную регистрацию сайта и возвращает свежие siteKey + secret, если вам нужен отдельный изолированный профиль.",
        "DELETE /api/v1/sites удаляет домен только при наличии правильного sk_live серверного ключа.",
        "Challenge-логика дополнительно запрашивает несколько бесплатных IP-баз и определяет, похож ли IP на хостинг, прокси, VPN, Tor, мобильную сеть или домашний ISP.",
        "POST /api/v1/challenge принимает телеметрию, считает риск и либо выдаёт токен, либо переводит сессию на visual fallback.",
        "POST /api/v1/verify валидирует подписанный токен, проверяет origin-привязку или secret key и одноразово расходует токен.",
        "POST /public/api/v1/verify поддерживает тот же verify-поток и дополнительно принимает поля `origin`, `domain` и `secretKey` для server-to-server интеграций.",
        "GET /api/v1/widget.js отдаёт framework-free загрузчик для встраивания в любую страницу.",
        "GET /captcha/widget отдаёт iframe-ready страницу виджета с параметрами `theme=dark|light`, а `siteKey` остаётся опциональным для совместимости.",
        "Страница `/sandbox` позволяет живьём тестировать HTML-форму, поведение виджета и логи challenge / verify в одном интерфейсе.",
      ],
    },
    dashboard: {
      eyebrow: "Открытая регистрация",
      title: "Получите ключи мгновенно, привяжите их к домену и запускайтесь бесплатно.",
      subtitle:
        "Без аккаунтов и авторизации. Вы отправляете домен или origin, AstraCaph возвращает public site key и private verification secret, а эта пара работает только для привязанного origin.",
      howItWorks: "Как это работает",
      notes: [
        "`POST /api/v1/sites` создаёт новую пару ключей без логина и привязывает её к конкретному origin, например `https://example.com`.",
        "Возвращённый `siteKey` используется в embed-виджете. Возвращённый `secret` хранится на вашем сервере и отправляется только в `/api/v1/verify`.",
        "Домены без протокола автоматически нормализуются к `https://`, чтобы привязка выглядела строго и предсказуемо в production-сценариях.",
        "Risk engine дополнительно проверяет IP через несколько бесплатных IP-баз и повышает риск, если адрес похож на хостинг, прокси, VPN или Tor.",
        "Сохраните `sk_live` и TXT-бэкап. Этот же ключ нужен и для verify на сервере, и для удаления домена позже.",
      ],
    },
    registration: {
      section: "Выдача ключей",
      title: "Привяжите домен и получите рабочую пару API-ключей.",
      subtitle:
        "Можно отправить `example.com` или `https://example.com`. Домены без протокола автоматически нормализуются к `https://`.",
      warning:
        "Сохраните `sk_live` серверный ключ сразу после выдачи. Он нужен для backend verification и для удаления привязанного домена позже.",
      domainLabel: "Домен или origin",
      domainPlaceholder: "example.com или https://example.com",
      siteNameLabel: "Имя сайта",
      siteNamePlaceholder: "Мой проект",
      submit: "Выдать ключи",
      submitPending: "Выдаю ключи...",
      issueError: "Не удалось выдать ключи для этого origin",
      issueNetworkError: "Сетевая ошибка при выдаче ключей",
      successLead: "Пара ключей выдана для",
      successTail: "Сохраните secret сейчас: эта публичная страница не хранит и не показывает чужие серверные ключи повторно.",
      publicKey: "Публичный site key",
      privateSecret: "Приватный server secret",
      download: "Скачать TXT-бэкап",
      keepSecret: "Держите `sk_live` в секрете. Он даёт доступ к verify и delete-операциям.",
      embed: "Embed",
      verify: "Пример verify",
      backupTitle: "AstraCaph Recovery File",
      backupImportant: "Важно:",
      backupWarningOne: "Сохраните sk_live серверный ключ в безопасном месте.",
      backupWarningTwo: "Он нужен для серверной verify-проверки и для удаления привязанного домена позже.",
      backupSiteName: "Имя сайта",
      backupOrigin: "Origin",
      backupPublicKey: "Публичный site key",
      backupPrivateSecret: "Приватный server secret",
    },
    removal: {
      section: "Удаление домена",
      title: "Удаление доступно только при подтверждении оригинальным sk_live.",
      subtitle:
        "Чтобы удалить привязанный домен, укажите origin и соответствующий `sk_live` серверный ключ. Без этого ключа домен удалить нельзя.",
      domainLabel: "Домен или origin",
      domainPlaceholder: "example.com или https://example.com",
      secretLabel: "Подтвердите sk_live",
      secretPlaceholder: "sk_live_...",
      submit: "Удалить домен",
      submitPending: "Удаляю домен...",
      deleteError: "Не удалось удалить домен",
      deleteNetworkError: "Сетевая ошибка при удалении домена",
      removed: "Удалено:",
    },
    sandbox: {
      eyebrow: "Sandbox",
      title: "Экспериментируйте с HTML, капчей и живыми ответами API в одной лаборатории.",
      subtitle:
        "Песочница загружает реальный widget.js, показывает полученные токены, позволяет вручную вызвать verify и в реальном времени выводит request logs для challenge, verify и операций с сайтами.",
      editorLabel: "Sandbox HTML",
      editorTitle: "Редактируйте разметку и тестируйте виджет вживую",
      editorBody:
        "Превью автоматически подключает `/api/v1/widget.js` и ожидает контейнер с `id=\"astracaph-container\"`. `data-sitekey` можно не указывать.",
      editorHint:
        "Можно менять форму, стили и расположение контейнера. Виджет и hidden token будут работать прямо внутри фрейма.",
      previewLabel: "Live Preview",
      previewTitle: "Проверяйте капчу внутри изолированного фрейма",
      previewBody:
        "События виджета возвращаются на страницу, поэтому здесь удобно смотреть последний токен и сразу запускать ручную verify-проверку по текущему origin.",
      previewHint:
        "Sandbox preview. Edit the HTML on the left, interact with the widget here, then inspect server logs on the right.",
      logsLabel: "Request Logs",
      logsTitle: "Смотрите challenge и verify трафик в реальном времени",
      logsBody:
        "Панель опрашивает `/api/v1/logs` и фильтрует записи для открытого профиля AstraCaph, чтобы можно было быстро разбирать статусы, summary и server responses.",
      latestToken: "Последний токен:",
      noToken: "Токен еще не получен",
      previewEvents: "События превью:",
      waitingEvents: "Ожидание событий виджета",
      verifyAction: "Проверить последний токен",
      verifyingAction: "Проверяю токен...",
      verifyEmpty: "Токена пока нет. Сначала завершите сценарий виджета внутри превью.",
      verifyFailed: "Verify-запрос завершился ошибкой",
      verifyPlaceholder: "Ответ verify появится здесь",
      demoPair: "Используется открытый профиль AstraCaph и origin-bound verify без обязательного demo secret.",
      noLogs: "Логов пока нет. Сначала активируйте виджет внутри превью.",
      missingContainer: "В Sandbox HTML отсутствует элемент #astracaph-container",
      verifiedCaptured: "Поймано событие astracaph:verified",
      submitCaptured: "Пойман submit формы с astracaph-response",
      templateName: "Имя",
      templateNamePlaceholder: "Ада Лавлейс",
      templateEmail: "Email",
      templateEmailPlaceholder: "ada@example.com",
      templateButton: "Отправить демо-форму",
    },
  },
  en: {
    nav: {
      overview: "Overview",
      help: "Help",
      dashboard: "Keys",
      sandbox: "Sandbox",
    },
    shell: {
      tagline: "Traffic verification and protection platform",
    },
    home: {
      eyebrow: "Human-Centered Defense",
      title: "A lightweight CAPTCHA that works like a risk engine instead of a roadblock.",
      subtitle:
        "AstraCaph minimizes friction for real users first: passive telemetry when confidence is high, graceful escalation only when risk is unclear, and signed proof when your backend needs verification.",
      guide: "Open guide",
      dashboard: "Manage keys",
      demoLabel: "Live Demo",
      demoTitle: "This is how the captcha looks on a real page",
      demoBody:
        "Below is a real AstraCaph widget mounted in open mode. It shows the actual verification UI and the token issued after a successful pass.",
      demoTokenLabel: "Issued token:",
      demoTokenEmpty: "The token will appear here after successful verification",
      demoFootnote:
        "This example uses AstraCaph's open profile and renders the live production-style widget UI without a mandatory frontend key.",
      features: [
        "Fingerprint: User-Agent, Canvas, WebGL, timezone, screen metrics",
        "Motion analysis: pointer path smoothness, jitter, direction changes, idle pauses",
        "Behavior scoring: dwell time, click tempo, focus churn, key cadence",
        "IP intelligence: multiple free IP databases to estimate hosting / residential / proxy / vpn",
        "Security: HMAC JWT, rate limiting, optional verify IP allowlist",
      ],
      pillars: [
        {
          title: "Passive-first trust",
          body: "The widget first scores pointer movement, browser posture and interaction timing. Active verification appears only when the session remains uncertain.",
        },
        {
          title: "Low-latency edge flow",
          body: "Challenge and verify endpoints are designed for Vercel Edge with short TTFB, one-time signed tokens and lightweight request handling.",
        },
        {
          title: "Single-domain product",
          body: "Landing, docs, widget delivery and verification API live under one domain, keeping integration and origin governance simple.",
        },
        {
          title: "Open key issuance",
          body: "The default integration works without a frontend key. If you need stricter isolation, you can still issue secrets and bind verification to one exact origin.",
        },
      ],
    },
    help: {
      eyebrow: "Developer Help",
      title: "Embed one script, then verify the response token on your backend with an origin or secret.",
      subtitle:
        "AstraCaph supports an open mode without mandatory frontend keys. You can embed the widget immediately, then verify tokens by your site origin or by a secret key in stricter deployments.",
      flowNotes: "Flow notes",
      environment: "Recommended environment",
      steps: [
        {
          title: "0. Pick your site origin",
          snippet: `Example: https://example.com

Your backend will send this origin to AstraCaph
as the expected binding for the token.`,
        },
        {
          title: "1. Embed the widget",
          snippet: `<script src="https://caph.astracat.ru/api/v1/widget.js" async defer></script>
<div id="astracaph-container"></div>`,
        },
        {
          title: "2. Read the hidden response token",
          snippet: `<input type="hidden" name="astracaph-response" value="eyJ..." />`,
        },
        {
          title: "3. Verify on your backend",
          snippet: `POST https://caph.astracat.ru/api/v1/verify
Content-Type: application/json

{
  "token": "user_generated_token",
  "origin": "https://example.com"
}`,
        },
        {
          title: "4. Optionally create a secret-bound profile",
          snippet: `POST https://caph.astracat.ru/api/v1/sites
Content-Type: application/json

{
  "domain": "example.com",
  "name": "Example store"
}`,
        },
        {
          title: "5. Delete a bound domain",
          snippet: `DELETE https://caph.astracat.ru/api/v1/sites
Content-Type: application/json

{
  "domain": "example.com",
  "secret": "sk_live_..."
}`,
        },
      ],
      apiNotes: [
        "AstraCaph's default mode does not require a frontend site key: embedding `/api/v1/widget.js` with `#astracaph-container` is enough.",
        "POST /api/v1/verify can validate a token against `origin` or `domain`, which keeps Vercel deployments working even without a persistent site database.",
        "POST /api/v1/sites creates a free site registration and returns a fresh siteKey plus secret when you need a dedicated isolated profile.",
        "DELETE /api/v1/sites removes a registered domain only when the matching sk_live server secret is provided.",
        "Challenge logic also queries multiple free IP databases to estimate whether the IP looks like hosting, proxy, VPN, Tor, mobile carrier, or residential ISP.",
        "POST /api/v1/challenge accepts telemetry, computes a risk score and either returns a token or asks for a visual follow-up step.",
        "POST /api/v1/verify validates the signed token, checks origin binding or a secret key, and consumes the token once.",
        "POST /public/api/v1/verify supports the same verification flow and also accepts `origin`, `domain`, and `secretKey` for server-to-server integrations.",
        "GET /api/v1/widget.js serves a framework-free loader designed to initialize inside any page with a matching container.",
        "GET /captcha/widget serves an iframe-ready widget page with `theme=dark|light`, while `siteKey` remains optional for compatibility.",
        "The `/sandbox` page lets you test custom HTML, widget behavior, and challenge / verify logs in one live debugging surface.",
      ],
    },
    dashboard: {
      eyebrow: "Open Registration",
      title: "Issue a key pair instantly, bind it to your domain, and start for free.",
      subtitle:
        "There is no account gate in this flow. You submit a domain or origin, AstraCaph returns a public site key plus a private verification secret, and that key pair only works for the bound origin.",
      howItWorks: "How it works",
      notes: [
        "`POST /api/v1/sites` creates a new key pair without login and binds it to one exact origin such as `https://example.com`.",
        "The returned `siteKey` is used in the widget embed. The returned `secret` stays on your backend and is sent only to `/api/v1/verify`.",
        "Domains without a protocol are normalized to `https://` automatically so the binding stays strict and predictable for production use.",
        "The risk engine also checks the IP through multiple free IP databases and increases risk when the address looks like hosting, proxy, VPN, or Tor infrastructure.",
        "Save `sk_live` and the TXT backup. The same secret is required for backend verification and for deleting the domain later.",
      ],
    },
    registration: {
      section: "Generate Keys",
      title: "Bind a domain and receive a live API key pair.",
      subtitle:
        "Submit `example.com` or `https://example.com`. Domains without a protocol are normalized to `https://` automatically.",
      warning:
        "Save the `sk_live` server secret immediately after registration. It is required for backend verification and for deleting the bound domain later.",
      domainLabel: "Domain or origin",
      domainPlaceholder: "example.com or https://example.com",
      siteNameLabel: "Site name",
      siteNamePlaceholder: "My product",
      submit: "Issue key pair",
      submitPending: "Issuing keys...",
      issueError: "Unable to issue keys for this origin",
      issueNetworkError: "Network error while issuing the key pair",
      successLead: "Key pair issued for",
      successTail: "Save the secret now: this public page does not store and re-display server secrets later.",
      publicKey: "Public site key",
      privateSecret: "Private server secret",
      download: "Download TXT backup",
      keepSecret: "Keep `sk_live` private. It unlocks verify and delete operations.",
      embed: "Embed",
      verify: "Verify example",
      backupTitle: "AstraCaph Recovery File",
      backupImportant: "Important:",
      backupWarningOne: "Save the sk_live server secret in a secure place.",
      backupWarningTwo: "It is required for backend verification and for deleting the bound domain later.",
      backupSiteName: "Site name",
      backupOrigin: "Origin",
      backupPublicKey: "Public site key",
      backupPrivateSecret: "Private server secret",
    },
    removal: {
      section: "Remove Domain",
      title: "Deletion requires the original sk_live secret.",
      subtitle:
        "To remove a bound domain, provide the same origin and the matching `sk_live` server secret. Without that secret the domain cannot be deleted.",
      domainLabel: "Domain or origin",
      domainPlaceholder: "example.com or https://example.com",
      secretLabel: "Confirm sk_live",
      secretPlaceholder: "sk_live_...",
      submit: "Delete domain",
      submitPending: "Deleting domain...",
      deleteError: "Unable to delete the domain",
      deleteNetworkError: "Network error while deleting the domain",
      removed: "Removed:",
    },
    sandbox: {
      eyebrow: "Sandbox",
      title: "Experiment with HTML, captcha behavior, and live API responses in one lab.",
      subtitle:
        "The sandbox loads the real widget.js, captures issued tokens, lets you trigger verify manually, and streams request logs for challenge, verify, and site lifecycle operations.",
      editorLabel: "Sandbox HTML",
      editorTitle: "Edit markup and test the widget live",
      editorBody:
        "The preview auto-loads `/api/v1/widget.js` and expects a container with `id=\"astracaph-container\"`. `data-sitekey` is optional.",
      editorHint:
        "You can change the form, styles, and container layout. The widget and hidden response token will keep working inside the frame.",
      previewLabel: "Live Preview",
      previewTitle: "Interact with the captcha inside an isolated frame",
      previewBody:
        "Widget events flow back to this page, making it easy to inspect the latest token and manually run verify against the current origin.",
      previewHint:
        "Sandbox preview. Edit the HTML on the left, interact with the widget here, then inspect server logs on the right.",
      logsLabel: "Request Logs",
      logsTitle: "Watch challenge and verify traffic in real time",
      logsBody:
        "This panel polls `/api/v1/logs` and filters entries for AstraCaph's open profile so you can inspect statuses, summaries, and scoring responses.",
      latestToken: "Latest token:",
      noToken: "No token captured yet",
      previewEvents: "Preview events:",
      waitingEvents: "Waiting for widget events",
      verifyAction: "Verify latest token",
      verifyingAction: "Verifying token...",
      verifyEmpty: "No token yet. Complete the widget flow inside the preview first.",
      verifyFailed: "Verify request failed",
      verifyPlaceholder: "Verify response will appear here",
      demoPair: "Uses AstraCaph's open profile and origin-bound verify with no mandatory demo secret.",
      noLogs: "No logs yet. Trigger the widget inside the preview first.",
      missingContainer: "Sandbox HTML does not include #astracaph-container",
      verifiedCaptured: "astracaph:verified event captured",
      submitCaptured: "form submit captured with astracaph-response",
      templateName: "Name",
      templateNamePlaceholder: "Ada Lovelace",
      templateEmail: "Email",
      templateEmailPlaceholder: "ada@example.com",
      templateButton: "Submit demo form",
    },
  },
};

export function resolveLocale(input: string | null | undefined): Locale {
  return (input ?? "").toLowerCase().includes("ru") ? "ru" : "en";
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
