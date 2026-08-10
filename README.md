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

```bash
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-smtp-email@gmail.com
CONTACT_TO_EMAIL=your@gmail.com

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


## Build

```bash
npm run build
npm start
```