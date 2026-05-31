# JusticeVerse — PRD & Build Log

## Original Problem Statement
Premium enterprise-grade Legal AI platform "JusticeVerse" — dark luxury theme (black/ivory/gold),
serif headings, glassmorphism, India's most advanced AI legal workspace for lawyers, judges,
students, researchers and law firms. 8 modules + owner dashboard + monetization.

## User Choices (locked)
- AI engine: **Gemini 3.1 Pro** (gemini-3.1-pro-preview) via Emergent Universal LLM key
- Auth: **Email/Password (JWT, httpOnly cookies) + Emergent Google login**
- Payments: **Razorpay** (test keys configured)
- Design: refined dark luxury (Cormorant Garamond / Manrope / Space Mono, #0A0A0A / #FFFFF0 / #D4AF37)

## Architecture
- Backend: FastAPI (modular) + MongoDB (motor). UUID-based ids, `_id` always excluded.
  - server.py (app + startup seed), auth.py, ai.py, routes_legal/hub/careers/ai/admin/payments.py, seed.py
- Frontend: React + Tailwind + shadcn + framer-motion. AuthContext, ProtectedRoute, AuthCallback.
- Routes: / /justicebot /database /knowledge-hub /careers /pricing /login /register /dashboard /admin

## User Personas
1. Visitor — read articles/news, search judgments, limited JusticeBot (5 queries), view vacancies.
2. Registered User — unlimited search, save library, applications, AI research, dashboard.
3. Admin/Owner — full content management, judgment upload, vacancy mgmt, analytics, users.

## Implemented (v1 — 2026-05-31)
- Homepage: hero, 8-module bento grid, stats, RAG/disclaimer banner, news preview.
- Module 1 JusticeBot AI: chat with Gemini 3.1 Pro, English/Hindi/Gujarati, suggestions, disclaimer, persisted sessions/messages, visitor 5-query limit.
- Module 2 Legal Database: search + category filters (SC/HC/Statutes/Corporate), seeded landmark docs, save to library.
- Module 6 Knowledge Hub: articles list + reader modal, legal news feed with filters.
- Module 7 Careers: vacancy cards by type, Quick Apply (auth), application tracking.
- Auth: register/login/logout/me/refresh/forgot/reset (JWT cookies) + Google /auth/session. Admin seeded. Brute-force lockout (X-Forwarded-For) verified.
- Owner Dashboard: stats, tabbed CRUD for Articles/News/Judgments/Vacancies, Applications + Users views.
- Monetization: /api/plans, Razorpay create-order + signature verify, plan upgrade. Pricing page with checkout.
- User Dashboard: profile, plan badge, saved library, applications, research history, upgrade CTA.
- SEO meta + PWA manifest + custom fonts.

## Testing
- iteration_1: backend 37/38 pytest (brute-force fixed post-test → now passing), frontend 100% smoke flows.
- Suite: /app/backend/tests/backend_test.py

## Prioritized Backlog (deferred)
- P0: CaseBrief AI (PDF/DOCX upload + OCR + brief generation) — Module 3
- P0: DraftGen AI (document generation, editable Word output) — Module 4
- P1: PrepMate AI (quizzes, mock tests, study plans) — Module 5
- P1: Law Firm Workspace (matter/client/hearing/billing) — Module 8
- P1: Scheduled publications, auto metadata/OCR on judgment upload, AI knowledge training UI
- P2: Multi-language UI (i18n) beyond AI answers, Razorpay webhook + subscription renewals, email notifications (Resend), object storage for resume/PDF uploads
- P2: Article edit UI in admin, downloadable reports (PDF/DOCX), citation generator standalone

## Credentials
See /app/memory/test_credentials.md (admin@justiceverse.in / JusticeVerse@2026).

## Iteration 2 (2026-05-31) — Requested changes
- Removed "Prestige AI Workspace" tagline; removed "Judgments Indexed" stat.
- Renamed: JusticeBot AI → JusticeVerse AI (bot "Verse AI"); DraftGen → VerseDraft; Indian Legal Database → Cases & Interpretation (/cases); Law Firm Workspace card → Subscription.
- New top nav (one-click tools): JusticeVerse AI, Counsel AI, Cases & Interpretation (+ Knowledge Hub, Careers, Subscription). Nav moved to xl breakpoint to fit cleanly.
- NEW **Counsel AI** page (/counsel) — VerseDraft Studio: pick document type (bail/writ/plaint/NDA…), output language, matter details → AI-generated draft with Copy/Download. Backend POST /api/draft (auth required).
- Free AI questions reduced 5 → 4.
- Languages expanded to 11 (English, Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, Kannada, Punjabi, Malayalam, Urdu) via dropdown on chat + Counsel AI.
- Tested: iteration_2.json backend 5/5, frontend 100% smoke.
