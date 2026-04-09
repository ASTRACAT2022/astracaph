# AstraCaph

Edge-first bot protection system for `caph.astracat.ru`.

## Routes

- `/` landing
- `/help` developer docs
- `/dashboard` owner dashboard
- `/api/v1/sites` public site registration and key issuance
- `/api/v1/widget.js` widget loader
- `/api/v1/challenge` telemetry intake and risk scoring
- `/api/v1/verify` server-to-server token verification

## Local launch

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` into `.env.local` and set:

- `ASTRACAPH_TOKEN_SECRET` for HMAC signing
- `ASTRACAPH_SITE_CONFIG` as optional JSON seed with public/private key pairs
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for Redis-backed state
- `VERIFY_TRUSTED_IPS` as comma-separated IP allowlist for `/verify` if needed

If Upstash is not configured, the app falls back to in-memory state suitable only for local development.

## Site lifecycle

- `POST /api/v1/sites` issues `pk_live_*` and `sk_live_*` for a bound origin
- Save `sk_live_*` immediately; it is required for backend verification and for domain deletion
- `DELETE /api/v1/sites` removes a bound domain only when the matching `sk_live_*` secret is provided
