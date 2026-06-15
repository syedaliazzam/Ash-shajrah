# Ash-Shajrah Learning Hub

Premium animated landing page for **Ash-Shajrah Learning Hub** — a fully online learning hub focused on values, creativity, and confidence.

## Tech Stack

- **Next.js 15** (App Router, React 19)
- **Tailwind CSS 4**
- **GSAP + ScrollTrigger** — scroll-driven animations and section reveals
- **Cinematic hero video** with animated online-learning fallback

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Brand Assets

Official logo: `public/ash-shajrah-logo.png` (displayed in header & footer). Favicon uses the compact `public/ash-shajrah.png`.

## Contact Placeholders

Update contact details in `src/lib/data.ts`:

- Phone number
- WhatsApp link
- General email

## Admission Form Email (required for production)

Copy `.env.example` to `.env.local` and configure SMTP:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-smtp-email@gmail.com
CONTACT_TO_EMAIL=admission.ashshajrah@gmail.com
```

On Vercel, add the same variables in **Project Settings → Environment Variables**.

Inquiries are sent to `admission.ashshajrah@gmail.com` via `/api/contact`.

## Hero Video

Place your hero MP4 at `public/videos/montessori-children-learning.mp4`.

## Build

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Import the repo: [github.com/Paramount-Intelligence/Ash-shajrah](https://github.com/Paramount-Intelligence/Ash-shajrah)
2. Vercel auto-detects **Next.js** (see `vercel.json` in the project root).
3. Use default settings — **Build Command:** `npm run build`, **Output:** Next.js default.
4. Deploy. No environment variables are required for the landing page.

Or via CLI:

```bash
npm i -g vercel
vercel
```

## Live Site

[ash-shajrah.vercel.app](https://ash-shajrah.vercel.app)
