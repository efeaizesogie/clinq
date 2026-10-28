# Clinq Landing — Design Direction

## Brand brief
Clinq is a hospital booking and patient-portal product for patients (and the clinicians who serve them). The page must feel like an institution you can trust with your health record — calm, precise, quietly expensive — not a startup selling features. The single action: **Book an appointment**.

Brand-locked: Clinq navy, teal, light canvas, Manrope, and the existing `/public` artwork stay. References supply composition, layout and motion only.

## Brand tokens

```css
:root {
  --color-canvas: #f8f9ff;   /* Clinq light bg — page canvas */
  --color-surface: #ffffff;  /* cards, alternating bands */
  --color-navy: #00355f;     /* headings, primary action, wordmark */
  --color-navy-2: #0f4c81;   /* hover, gradients */
  --color-ink: #0d1c2e;      /* strong body text */
  --color-steel: #5e6673;    /* body / muted (AA on white) */
  --color-fog: #9aa1ad;      /* tertiary, placeholders */
  --color-line: #e3e6ee;     /* hairlines */
  --color-teal: #5f9ea0;     /* data, status, dots, icons — never body copy */
  --color-teal-ink: #33797b; /* teal when it must be text (AA) */
}
```
Dark mode overrides the same tokens (canvas `#080f18`, surface `#0d1c2e`, action becomes teal on navy-dark).

Type: Manrope 400–800 for everything (tight tracking: −0.035em at 56px+, −0.02em at 32–48px). JetBrains Mono only for real data — record IDs, timestamps, coordinates. Never for labels or decoration.

## References

| Style | URL | Borrowed |
|---|---|---|
| **Column** — "deep navy ledger under cool dawn" | https://styles.refero.design/style/a76ec6ba-20b3-495c-9d89-1e58281e79e7 | Primary structure. Split hero (headline left ~40%, floating product widget right) over a halftone dot-field signature visual; logo bar closing the hero; fixed nav transparent-with-blur → white on scroll; text-left / product-right feature rows; white ↔ canvas alternating bands; 8px radius buttons and cards, pills only for badges; navy filled + navy outlined CTA pair (never two filled); five-layer progressive shadow on product cards, dramatic off-axis shadow on the single floating widget. |
| **Function Health** — "warm apothecary journal on parchment" | https://styles.refero.design/style/21b71be3-78a0-4681-a5b9-64cc4b40eb67 | Steps with a micro-UI preview below each (as an ordered list in hairline-divided columns, not boxed cards); credentialed testimonials laid inline with no card chrome; dot-separated inline tag list (used for department filters). |

**Clinq's own signature:** Column's halftone world map is replaced with a halftone **heartbeat** — a dot field whose dots swell along an ECG trace, navy → teal, with a slow monitor sweep travelling across it. It reappears once, inverted, behind the closing CTA.

## The page as a story

1. **Hook — Hero.** "Healthcare that fits your life." Left-aligned, confident. The heartbeat field breathes behind; a single upcoming-visit widget floats right, already confirmed. Feel: *this already works.* Motion: the monitor sweep across the dots — the page's only ambient motion.
2. **Proof — Insurer bar + showcase.** Monochrome wordmarks, then the real dashboard rising into full size, with patient and specialist numbers stated in one sentence beneath it. Feel: *other people trust this.* Motion: the showcase opens up on scroll (the one authored scroll moment).
3. **Curiosity — Scheduling.** Text left, live availability product card right. Feel: *no phone queue.* The real booking screen in a product frame.
4. **Meaning — Records.** The real portal artwork in a product frame with a floating lab-result card. Feel: *my history is safe and mine.*
5. **Ease — Three steps.** An ordered list of three columns with micro previews. Feel: *I could do this in a minute.*
6. **Desire — Specialists.** A ledger-style directory list, filterable by department. Feel: *real people, available now.*
7. **Reassurance — Voices.** Inline testimonials, no cards. FAQ beside clear hairlines.
8. **Grounding — Campuses.** Choose a campus, the map updates.
9. **Action — Closing band.** Navy band with the inverted heartbeat; navy-on-white primary CTA repeated at the emotional peak.

## Do
- Keep the canvas 95% achromatic; navy is structure, teal is data — dots, checks, status, numbers.
- One filled CTA per group, paired with an outlined one.
- 8px radius on buttons/inputs/cards; 9999px only on badges and status chips.
- Elevation only where something should feel like an object (product cards, the hero widget).
- Every number, quote and claim comes from Clinq's existing content.

## Don't
- No kicker/eyebrow labels above headings — the heading carries its own weight.
- No hero-metric templates (big number + small label rows); state numbers in a sentence.
- No identical icon + heading + text card grids, and never a card inside a card.
- No entrance animation on every section, and nothing that starts invisible.
- No coloured left/right accent bars on list items; active states use background and weight.
- Tertiary text still clears WCAG AA (fog is #687080, not lighter).
- No gradients on UI surfaces; the dot field is the only decorative colour.
- No teal body copy, no teal buttons in light mode.
- No stock photography, no 3D, no emoji, no glassmorphism stacks.
- No more than two shadow recipes on screen at once.
- Never copy Column's or Function's copy, logos or imagery.
