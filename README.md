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

## Contact Details

Contact information is configured in `src/lib/data.ts` (WhatsApp, admission email, admin office).

## Contact Form (`/api/contact`)

Inquiries are emailed to `admissions@ashshajrah.com` and appended to a Google Sheet.

Copy `.env.example` to `.env.local` and configure **SMTP** and **Google Sheets**:

```bash
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-smtp-email@gmail.com
CONTACT_TO_EMAIL=admissions@ashshajrah.com

# Google Sheets
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_RANGE=Inquiries!A:E
```

### Google Sheets setup

1. In [Google Cloud Console](https://console.cloud.google.com/), enable the **Google Sheets API** for your project.
2. Create a **Service Account** and download its JSON key (keep this secret — never commit it).
3. Create a Google Sheet with a tab named `Inquiries` and header row:
   `Timestamp | Name | WhatsApp | Email | Message`
4. **Share the sheet** with the service account email as **Editor**.
5. Copy the Sheet ID from the URL (`https://docs.google.com/spreadsheets/d/SHEET_ID/edit`).
6. Add the environment variables above to `.env.local` (local) and Vercel **Project Settings → Environment Variables** (production).
7. Restart the dev server after adding env variables: `Ctrl+C`, then `npm run dev`.

Never expose `GOOGLE_PRIVATE_KEY` or other secrets on the frontend or in git.

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
4. Deploy. Add SMTP and Google Sheets environment variables for the contact form (see above).

Or via CLI:

```bash
npm i -g vercel
vercel
```

## Live Site

[ash-shajrah.vercel.app](https://ash-shajrah.vercel.app)
