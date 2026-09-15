# SmartEmail

An email execution prototype: understand commitments, inspect sources, prepare a
reply, review it, and close the loop.

**[Open the live demo](https://mwxmfz47.insforge.site/login)** and choose **Demo account**.

## Demo walkthrough

1. Open Today and select the pitch-deck commitment.
2. Inspect its source email and choose Draft reply.
3. Prepare a draft, edit its body, review, and simulate sending.
4. Open Approvals or Activity to inspect the saved action.
5. Complete a commitment, refresh, and confirm the change persists.
6. Search for Acme and follow a source to its thread.
7. Snooze a follow-up for 24 hours, 3 days, or a week. Find it under Scheduled;
   dismissed follow-ups can be restored from the Dismissed view.

Demo sessions use server-only InsForge storage and random HttpOnly cookies.
Visitors have separate state and access expires after 24 hours. Expired rows are
removed when a new session starts. Sessions and drafts are capped; high-volume
use still needs hosting-level rate limiting. Never enter private data in the demo.

**Demo drafts are templates, search matches sample conversations, and sends,
refunds, and CRM updates are simulated. No external email or payment is sent.**

## Development

Requires Node.js 22 or newer. Configure `.env.local` using `.env.example`, then:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Use an InsForge backend with the included migrations.
Set `NEXT_PUBLIC_DEMO_MODE=true` for the demo button. The demo API runs in Next.js
at `/api/demo`; no separate localhost API server is needed for it.

## Environment

- `NEXT_PUBLIC_APP_URL`: exact app origin, HTTPS in production.
- `NEXT_PUBLIC_INSFORGE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`: public backend configuration.
- `INSFORGE_API_KEY`: server-only admin key for protected backend routes.
- `NEXT_PUBLIC_DEMO_MODE`: explicit switch for synthetic demo access.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: server-only Gmail OAuth credentials.
- `GMAIL_TOKEN_ENCRYPTION_KEY`: persistent random 32-byte key as 64 hex characters.
- `NEXT_PUBLIC_API_URL`: reserved for the separate workflow API. Real-user AI workflows are not wired yet.

Never commit environment files, `.insforge`, refresh tokens, or server keys.

## Authentication and Gmail

Email signup/sign-in uses InsForge SSR sessions with HttpOnly refresh cookies.
Google sign-in requires an InsForge provider configuration and redirect allowlist
including `https://YOUR_HOST/api/auth/callback`.

Gmail authorization is separate from Google sign-in. Enable Gmail API, configure
consent/test users, and register `https://YOUR_HOST/api/gmail/callback`. Sign in,
open Settings, and connect Gmail. Encrypted credentials, authenticated mailbox
operations, MIME replies, attachments, and durable send claims are implemented.

**Real Gmail OAuth and delivery have not been verified.** Credentials are still
required. Real-mail AI extraction, semantic search, complete historical sync,
and third-party integrations are not production-complete. The demo is not proof
of real-provider functionality. Real accounts never fall back to demo data.

## Verification

```bash
npm test
npm run lint
npm run build
```

Tests cover demo state isolation, reviewed drafts, idempotent approvals,
citations, auth isolation, Gmail encryption, MIME, and send uncertainty.
The dependency audit flags PostCSS and Vitest tooling advisories. Resolve these
and complete provider/security acceptance testing before production use.

## Deployment

`vercel.json` deploys the Next.js source and server routes. GitHub Pages cannot
run this app. Import this repository into Next.js-compatible hosting, or use
InsForge with the intended project linked:

```bash
npx -y @insforge/cli link
# Configure environment variables securely in hosting settings.
npm run build
npx -y @insforge/cli deployments deploy .
```

Set InsForge auth redirect allowlists for the deployed origin. For a new backend,
apply `migrations/` SQL files in chronological order before enabling demo/Gmail.
GitHub CI verifies tests, lint, and build; it does not automatically deploy or
hold backend secrets. The live deployment is managed through InsForge.
