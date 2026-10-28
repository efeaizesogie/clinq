# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary audiences, weighted equally on the public site:

- **Patients** — adults booking specialist care for themselves and, often, their dependents. They arrive needing to find the right department or doctor, see real availability, and book; afterwards they return to the portal to read lab results, manage prescriptions, message their care team, and settle bills.
- **Clinicians and hospital staff** — specialists, coordinators and administrators who run schedules, patient records, staff directories, inventory and analytics in the admin console, and who judge whether Clinq is a credible clinical tool.

## Product Purpose

Clinq is a hospital booking and patient-portal platform: one system where a hospital's patients find a specialist, book an in-person or telehealth slot in real time, and keep their health record, results, prescriptions, messages and billing in one place, while the hospital's clinical and administrative staff operate scheduling, records and staff from the same data.

Success means a patient goes from "I need a specialist" to a confirmed slot without a phone call, and staff stop reconciling paper, phone and separate systems.

## Positioning

Clinq is software-as-a-service for hospitals, also developed as a training project. It connects the patient-facing booking and records experience and the staff-facing operations console on one shared record, rather than bolting a booking widget onto a separate hospital system.

Open decision: whether the public site speaks as a single hospital's branded site (departments, campuses, "visit our hospital") — as it does today — or as Clinq marketing itself to hospitals. Future copy should not mix the two without a decision.

## Operating Context

- Patient booking is a four-step flow: department → doctor → time → review/confirm, with in-person or telehealth visits.
- Patients reach the portal after sign-up with email confirmation; protected routes are `/patient/*` and `/admin/*`.
- The portal covers dashboard (vitals, upcoming visits, quick actions), appointments, health records (allergies, immunizations, clinical timeline, PDF/FHIR export), prescriptions with refills, lab/diagnostic reports, secure messaging, notifications, billing with card checkout, and settings including dependents and theme.
- The admin console covers overview, appointment schedule, patient management, staff directory and profiles, inventory, and analytics.
- Light and dark themes exist across the public site and portal; the user's choice is stored on their account.

## Capabilities and Constraints

- Next.js 16 (App Router), React 19, Tailwind CSS v4, GSAP; Supabase for auth, data and storage; Stripe for billing.
- Public content (departments, specialists, blog posts, platform counts) is loaded live from Supabase through `/api/platform-data`; pages must handle loading, empty and unavailable states.
- Specialist photo URLs in the data can be missing or broken.
- HIPAA compliance and 256-bit encryption are stated in existing product copy; treat as product claims to keep consistent, not new marketing.
- Five campus locations exist in code (London, Lagos, New York, Tokyo, Cape Town).

## Brand Commitments

- Name: **Clinq** (wordmark set in the site's sans, weight 800).
- Brand colours already in use: navy `#00355F` / `#0F4C81`, teal `#5F9EA0`, light canvas `#F8F9FF`.
- The owner has favoured the Column reference (styles.refero.design, "deep navy ledger under cool dawn") for layout and composition; see DESIGN.md for the current visual record.

## Evidence on Hand

- Real portal screens: `reference images/` (5K design exports of every patient and admin screen) and `public/screens/` (4K light/dark captures of dashboard, booking, health records and lab results, with the sample patient "Alex Morgan").
- Live specialist and department data from Supabase.

**Placeholder, not evidence:** every statistic and quote currently on the site is illustrative — "10k+ patients", "99.4% satisfaction", "20+ years", "500+ specialists / 45 clinics", "50+ specialists", the Chief Medical Officer's "40% reduction in surgical delays", the three patient testimonials (Marcus Sharma, Lisa Chen, James Miller), leadership names and photos, insurer names, and the campus address/phone. Future work must label these as sample content or remove them; never present them as fact and never invent replacements.

## Product Principles

1. **Booking is the product.** Every public surface leads to a real, working path to a confirmed slot, not a decorative link.
2. **One record, two sides.** Patient and clinician experiences are the same system viewed from different roles; design neither as an afterthought.
3. **Truth over polish.** Show real screens and real data; never dress placeholder numbers or quotes as proof.
4. **Calm under stress.** People arrive worried or busy; clarity, legibility and predictable controls outrank expression.

## Accessibility & Inclusion

- WCAG 2.2 AA as the floor: text contrast ≥4.5:1, visible keyboard focus, labelled controls, 44px touch targets on mobile.
- Respect `prefers-reduced-motion`; no content may depend on animation to appear.
- Both light and dark themes must meet the same contrast floor.
