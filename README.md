# ContentGenPro — AI-Powered Personal Branding Content Generator

Generate publish-ready social media content for LinkedIn, Instagram, and X — tailored to your profession, audience, and tone — in seconds.

**Live Demo → [content-gen-sooty.vercel.app](https://content-gen-sooty.vercel.app)**

---

## What it does

ContentGenPro solves a specific problem: creating consistent, platform-appropriate social content takes hours. This app reduces that to under a minute.

You tell it your industry, target audience, and content goal. It calls the OpenAI API to generate platform-tailored posts — LinkedIn thought leadership copy, Instagram captions with hashtags, X threads — ready to copy and publish. For Instagram, it generates downloadable carousel images (1080×1080px) directly in the browser using `html2canvas`.

Scheduled posts trigger reminder emails via an n8n automation workflow, so content doesn't get forgotten.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 13.5 (App Router) |
| Language | TypeScript 5.2 |
| UI | Tailwind CSS, shadcn/ui (Radix UI primitives) |
| AI | OpenAI API (GPT, via `openai` SDK v6) |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js |
| Image Delivery | ImageKit |
| Image Generation | html2canvas (Instagram carousels) |
| Forms & Validation | React Hook Form + Zod |
| Automation | n8n (scheduled content reminder emails) |
| Deployment | Vercel |

---

## Key Features

- **Onboarding flow** — collects profession, industry, target audience, and content goals to personalise every output
- **Multi-platform generation** — separate prompts and formatting logic for LinkedIn, Instagram, and X
- **Instagram carousel export** — generates 1080×1080px images client-side via html2canvas, downloadable instantly
- **Content scheduling** — schedule posts and receive reminder emails via n8n automation
- **Authentication** — NextAuth with Google OAuth and email/password
- **Persistent history** — all generated content saved to Supabase, accessible across sessions

---

## Architecture decisions worth noting

**Why html2canvas for carousel images instead of a server-side image library?**
Keeping image generation client-side avoided adding a server function and cold-start latency on Vercel's free tier. The trade-off is browser-environment constraints, but for 1080×1080 static carousels, html2canvas is more than sufficient.

**Why Supabase over plain PostgreSQL?**
Supabase gave real-time row-level security and a built-in auth layer that integrates cleanly with NextAuth. Setting up the same on a raw PG instance would have taken significantly longer for a solo project.

**Why n8n for email reminders instead of a cron job in the app?**
Externalising the scheduling logic to n8n means the Next.js app itself stays stateless and easier to reason about. n8n handles the retry logic, delivery tracking, and timing without any code inside the app.

---

## Local Setup

```bash
git clone https://github.com/Koushik2208/content-gen.git
cd content-gen
npm install
```

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
├── app/              # Next.js App Router pages and API routes
├── components/       # Reusable UI components (shadcn/ui + custom)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions, Supabase client, OpenAI helpers
├── server/           # Server-side logic and API handlers
├── sql/              # Supabase schema and migration files
└── public/           # Static assets
```

---

## Built by

[Gorre Koushik](https://linkedin.com/in/koushik-gorre) — Full-Stack Developer
[github.com/Koushik2208](https://github.com/Koushik2208)
