# Write Quest CMS + Email Collection Plan

## Goals
- Update landing page content without code edits.
- Collect signup emails reliably with consent records.
- Keep the current Next.js app fast and simple.

## Recommended Stack
- CMS: `Sanity` (fast setup, structured content, good media handling)
- Database (email list): `PostgreSQL` via `Neon` or `Supabase`
- ORM: `Prisma`
- Email service: `Resend` (double opt-in email workflow)
- Spam protection: `hCaptcha` or `Cloudflare Turnstile`

## Content Model (CMS)
Create a singleton document `landingPage`:
- `heroTitle` (string)
- `heroSubtitle` (string)
- `storyHeading` (string)
- `storyParagraph1` (text)
- `storyParagraph2` (text)
- `previewHeading` (string)
- `previewPrompt` (string)
- `learnSectionText` (text)
- `signupHeadline` (string)
- `signupSubheadline` (string)
- `footerCopyright` (string)
- `images` object:
  - `hero`
  - `topSection1`
  - `topSection2`
  - `story1`
  - `story2`
  - `gallery1..gallery5`
  - `before`
  - `after`
  - `bottom`

## Email Data Model (DB)
Table: `subscribers`
- `id` (uuid, pk)
- `email` (string, unique, indexed)
- `status` (`pending`, `confirmed`, `unsubscribed`)
- `consent` (boolean)
- `source` (string, default `landing_page`)
- `ipHash` (string, nullable)
- `userAgent` (string, nullable)
- `createdAt` (datetime)
- `confirmedAt` (datetime, nullable)

Table: `email_events`
- `id` (uuid, pk)
- `subscriberId` (fk)
- `eventType` (`signup`, `confirm`, `unsubscribe`, `bounce`)
- `metadata` (json)
- `createdAt` (datetime)

## API Endpoints (Next.js App Router)
- `POST /api/signup`
  - Validate email + captcha + consent.
  - Upsert subscriber as `pending`.
  - Send confirmation email with token.
- `GET /api/confirm?token=...`
  - Verify token and set subscriber `confirmed`.
- `POST /api/unsubscribe`
  - Set subscriber `unsubscribed`.
- `GET /api/admin/subscribers` (protected)
  - Paginated list export for operations.

## UI Changes
- Wire signup form submit to `/api/signup`.
- Add checkbox:
  - `I agree to receive product updates and launch invitations.`
- Inline status messages:
  - success, duplicate email, invalid email, network error.

## Security + Compliance
- Store only needed personal data.
- Add Privacy Policy + Terms links near signup.
- Add unsubscribe link in every email.
- Hash IP (optional) for abuse mitigation.
- Use server-side rate limiting by IP/email.

## Rollout Phases
1. Phase 1: Email capture MVP
   - DB schema, `/api/signup`, simple form success flow.
2. Phase 2: Double opt-in
   - Confirmation tokens and email templates.
3. Phase 3: CMS content integration
   - Replace hardcoded text/images with CMS fetch.
4. Phase 4: Admin/reporting
   - Secure subscriber dashboard + CSV export.

## Acceptance Criteria
- Non-technical user can update headline/subheadline/images in CMS.
- Signup stores records safely with duplicate protection.
- Confirmed subscriber flow works end-to-end.
- Bounce/unsubscribe statuses are tracked.

## Optional Enhancements
- Webhook sync to Mailchimp/ConvertKit.
- Segment signups by campaign/source.
- A/B test signup heading/button copy.
