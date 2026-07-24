# University2K26 V0.9 · Design QA

- **Source visual truth:** `reference/assets/jiaowu2k26-homepage-option-1-selected.png`
- **Implementation:** `http://127.0.0.1:4173/`
- **Implementation capture:** `app/apps/web/qa-v09-home-final-1440x1024.jpg`
- **Responsive capture:** `app/apps/web/qa-v09-mobile-final-390x844.jpg`
- **Compared state:** default MyCareer homepage with live local API handshake and Fixture-labelled course data
- **Desktop viewport:** 1440 × 1024 CSS px, device pixel ratio 1
- **Source pixels:** 1487 × 1058
- **Implementation pixels:** 1440 × 1024
- **Density normalization:** both artifacts were inspected at their complete desktop frame; their aspect ratios differ by less than 0.1%, so no density resampling was required
- **QA date:** 2026-07-24

## Full-view comparison evidence

The accepted visual and the current implementation were emitted together in one comparison input, with the source first and the implementation second. Both preserve the same major composition: dark arena, narrow left navigation, top season/data authority strip, one dominant course objective, four-stage progression, orange primary action, bottom Box Score and a student figure anchored to the right.

Intentional product changes are acceptable rather than fidelity regressions:

- the official display brand is now **University2K26 / 大学2K26** while `jiaowu2K26` remains only a compatibility identifier;
- the hero course is the sanitized local-index Demo course **信号与线性系统**, not the concept-art `PHYS 240`;
- evidence and backend state use real interactive controls rather than text painted into concept art;
- the implementation leaves more negative space around the objective and uses a real responsive layout rather than a single rasterized screen.

## Focused-region comparison evidence

A separate crop was not required. At the complete 1440 × 1024 comparison size, the top authority strip, navigation, headline, stage track, primary action, Box Score, character crop and footer controls were all readable. The course drawer, settings drawer and mobile state were inspected separately in the live Browser rather than compared to invented source screens.

## Required fidelity surfaces

### Fonts and typography

- Barlow Condensed provides the athletic display face; Inter and Noto Sans SC provide readable Latin and Chinese UI text.
- Headline, wordmark, stage labels, metric numerals and compact metadata have distinct optical roles and do not collapse into one generic type scale.
- Chinese course titles wrap cleanly at 390 × 844 without clipping or horizontal overflow.

### Spacing and layout rhythm

- Desktop has no horizontal or vertical overflow at 1440 × 1024.
- Hero, stage track, CTA and Box Score retain the source hierarchy.
- Mobile switches to a stacked document flow; measured document scroll width is 375 px inside a 390 px viewport, so no horizontal overflow is introduced.

### Colors and visual tokens

- Near-black surfaces, blue data light, restrained orange action emphasis and green live status match the accepted direction.
- Fixture purple, warning red and live green remain semantic rather than decorative.
- Focus and selected states keep visible non-color cues.

### Image quality and asset fidelity

- The Campus Arena background is a registered generated raster asset, not CSS/div art.
- Crop and subject placement preserve readable negative space on desktop and keep the student visible on the right.
- Mobile deliberately darkens and repositions the background so text contrast remains usable.
- Fluent UI System Icons are used consistently; no handcrafted SVG or emoji substitute is present.

### Copy and content

- App copy is specific to University2K26 and the current Demo course.
- `Fixture`, authority, source boundary and non-school-record warnings remain visible and understandable.
- No generated or local-index statement is presented as an official grade, enrollment record or school judgment.

### States, responsiveness and accessibility

- Verified live API, primary action success, Evidence, Course Film Room, settings, Fixture fallback, loading, offline, recoverable error and traditional narrative paths.
- Verified Reduced Motion: the shell enters `is-reduced-motion`; animation and transition durations fall to `0.00001s`.
- Semantic headings, regions, buttons, switches, progress bars, dialog focus and close/restore behavior are present in the Browser accessibility snapshot.
- Keyboard, mouse, touch and Gamepad API paths exist; physical controller and real-touch-device evidence remain separate hardware checks.
- The selected in-app Browser does not expose console-event collection. No runtime exception, broken state or navigation failure surfaced during the tested interactions.

## Findings

No actionable P0, P1 or P2 visual-fidelity finding remains for the accepted desktop homepage baseline.

- **P3 — compact mobile authority status**
  - Location: mobile top bar below 1000 px.
  - Evidence: season/API chips are hidden to preserve the two-row mobile header; the same authority and source boundary remain reachable through “查看依据”.
  - Impact: first-glance data-mode recognition is weaker on a narrow phone, but the task and evidence path remain usable.
  - Follow-up: when the mobile product shell becomes a separate accepted slice, consider a compact `LIVE / FIXTURE` text badge beside the evidence action.

## Comparison history

### Pass 1 · 2026-07-24

- Earlier P0/P1/P2 findings: none.
- Fixes made after comparison: none required.
- Post-fix evidence: not applicable; this first complete source-and-implementation comparison passed.

## Implementation checklist

- [x] Accepted visual target resolved unambiguously.
- [x] Registered Campus Arena raster asset used.
- [x] Desktop hierarchy and proportions preserved.
- [x] Course/data authority copy updated to the real Demo boundary.
- [x] Primary interaction and drawers work.
- [x] 1440 × 1024 and 390 × 844 layouts inspected.
- [x] Reduced Motion inspected.
- [x] No actionable P0/P1/P2 finding remains.
- [ ] Physical gamepad, real touch hardware and second-machine reproduction remain Gate evidence, not visual-QA blockers.

## Final result

final result: passed
