# P0-00-D0 · Design QA

## Comparison target

- Source visual truth: `../../../reference/assets/jiaowu2k26-homepage-option-1-selected.png`
- Source result: `call_hh4ZJjLdNykUTL9BF7t1ESH2`
- Rendered implementation: `http://127.0.0.1:4173/`
- Implementation screenshot: `qa-home-default-visible-1440x872.png`
- Normalized source crop: `qa-reference-crop-1440x872.png`
- Evidence drawer screenshot: `qa-evidence-drawer-1440x872.png`
- 125% equivalent post-fix screenshot: `qa-125-percent-after-fix-1152x819-visible.png`
- State: default Student / MyCareer homepage using explicitly labeled Fixture data

## Viewport and normalization

- Intended CSS viewport: 1440×1024 CSS px, device scale factor 1.
- Source pixels: 1487×1058.
- Browser layout metrics reported 1440×1024 with no horizontal or vertical document overflow.
- The in-app Browser capture surface emitted 1440×872 despite the 1440×1024 layout viewport. For a like-for-like visible-region comparison, the source top 1487×900 region was resized to 1440×872 and compared in the same image input with the 1440×872 implementation screenshot.
- Footer geometry was checked separately from the DOM at CSS `y=952`, `height=72`, `bottom=1024`.
- Attempts to force a 1440×1024 stitched capture duplicated the top region and were rejected as invalid QA evidence.

## Full-view comparison evidence

The normalized source crop and implementation screenshot were opened together in one comparison input. The shared composition is preserved:

- dark broadcast HUD and original Campus Arena background;
- wordmark and MyCareer role at the top;
- left navigation rail with one orange active state;
- PHYS 240 hero objective, four-stage progression and one large primary action;
- grouped four-column season score panel;
- fictional student hero on the right;
- visible Fixture/data-status and Evidence entry.

The implementation intentionally replaces the mock's baked-in logos, charts and brand-like decorative marks with a clean ImageGen environment plus Microsoft Fluent System Icons. No NBA, 2K or ESPN protected asset is used.

## Focused-region evidence

- Evidence Drawer: opened from the unique `查看依据` action; visual capture is `qa-evidence-drawer-1440x872.png`. It clearly distinguishes Fixture data from school records and exposes source, authority level, timestamp and scope.
- Focus return: after `我已了解数据边界`, the drawer closed and focus returned to `查看依据`.
- Primary action: `继续今日赛程` entered a loading state and resolved to `进入综合演练`.
- Error state: simulated failure displayed a labeled, recoverable alert without losing the page.
- Keyboard focus: ArrowDown moved from `恢复` to `确认当前选项`.
- No additional typography crop was required because the wordmark, H1, stage labels, CTA and small evidence text were readable in the full-view and drawer captures.

## Required fidelity surfaces

- Fonts and typography: Barlow Condensed is used for game-display text and statistics; Noto Sans SC and Inter are local Fontsource assets for Chinese/body text. Hierarchy and optical weight are close to the mock; no text truncation was observed at 1440 or the 1152×819 scaling check.
- Spacing and layout rhythm: major frame proportions, rail width, content order and primary-action emphasis match the source. Panels are slightly more rectilinear and restrained than the generated mock, which is acceptable for the system foundation.
- Colors and tokens: signal orange, information blue, graphite surfaces, Fixture purple and semantic success/error colors map to `engineering/DESIGN-SYSTEM.md`. Status never relies on color alone.
- Image quality and asset fidelity: the clean Campus Arena raster is sharp, correctly cropped and leaves usable negative space. The subject and atmosphere match the source while removing baked UI, logos and illegible pseudo-text.
- Copy and content: student role, 2026 spring season, Fixture status, update time, Evidence and one next action are explicit. Narrow layouts repeat the season in the identity line.
- Icons: all visible interface icons use one Fluent System Icons family; no emoji, inline SVG, handcrafted SVG or placeholder image is used.
- Accessibility: semantic buttons/dialog/switches/progressbars, visible focus, keyboard reachability, focus restoration and `prefers-reduced-motion` behavior are present. Pointer events now distinguish mouse and touch for adaptive, non-exclusive command hints; coarse-pointer targets use a 44 CSS px floor and mobile safe-area padding. Controller input is normalized to semantic actions, but physical-controller, real-touch and assistive-technology passes remain outstanding.

## Findings

- [P1 open] The interaction has transitions but not yet a complete game-feedback choreography.
  - Evidence: the implementation has scene/panel entry, focus transitions, drawer/toast and progress animations, but the primary action does not yet express the full `acknowledgement → commitment → resolving → result → replay → next move` grammar.
  - Impact: static hierarchy feels game-ready, while repeated interaction still feels closer to a polished application than a authored game loop.
  - Required next step: implement one interruptible primary-action sequence against `engineering/MOTION-SYSTEM.md`, profile its frame time, then repeat the offline/error/reduced-motion paths before visual acceptance.

- [P2 resolved] Windows 125% equivalent viewport initially scrolled past persistent controls.
  - Location: compact desktop layout, 1152×819.
  - Earlier evidence: `scrollHeight=907`, footer bottom `907`, viewport height `819`.
  - Impact: the persistent controller bar was not initially visible.
  - Fix: added a height-aware compact layout in `src/styles.css` that reduces shell chrome and panel vertical spacing without removing information.
  - Post-fix evidence: `qa-125-percent-after-fix-1152x819-visible.png`; `scrollHeight=819`, footer bottom `819`.

- [P2 resolved in code, capture pending] Narrow desktop hid the top season chip.
  - Location: identity context below the page kicker at widths under 1000px.
  - Earlier evidence: 900px screenshot retained role and Fixture but hid the top season chip.
  - Impact: one of the five required homepage questions was no longer answered in the main content.
  - Fix: the identity line now reads `学生 · MyCareer · 2026 春季赛季`, preserving the same information when top chips collapse.
  - Post-fix evidence: production build passed, but the in-app Browser rejected the final reload under its local-URL security policy, so the updated render could not be recaptured in this run.

- [P2 resolved in code, interaction evidence pending] The footer exposed controller glyphs even when mouse or touch was the active input.
  - Earlier behavior: footer hints remained `A/X/B`, and the status merged keyboard/mouse into one label. Clicking the footer confirm control could also attempt to activate itself instead of the visible primary action.
  - Fix: last-pointer input now distinguishes mouse from touch, hint chips adapt to `Enter/E/Esc`, `左键` or `轻触`, and the footer confirmation explicitly invokes the primary action. The control guide names all four direct input families.
  - Build evidence: Vite production build and Sites package tests 4/4 passed after the change.
  - Remaining evidence: mouse, touch emulation and real-touch screenshots/interaction traces have not yet been captured; this is not a usability-validation claim.

## Open questions and residual test gaps

- The generated mock uses more baked broadcast spectacle; the implementation uses a calmer, system-ready panel treatment. User visual acceptance decides whether this is the desired balance.
- Physical Gamepad API validation is not claimed. The current pass covered keyboard semantic actions and the implemented standard-gamepad polling path; two real controller layouts remain a later hardware gate.
- Mouse/touch adaptive hints and coarse-pointer sizing are code-complete but still require Computer Use/browser evidence; touch emulation cannot replace a real touchscreen pass.
- The latest one-line narrow-layout copy fix still needs one browser-rendered recapture.
- Runtime motion has not been frame-profiled, audio/haptics are not implemented, and no claim of AAA-quality interaction is made.

## Implementation checklist

- [x] Record the selected visual target, decision, source result and SHA-256.
- [x] Generate and register a clean original Campus Arena runtime asset.
- [x] Implement the default homepage, focus graph, Evidence Drawer and primary-action loading flow.
- [x] Implement offline, recoverable error, traditional narrative and reduced-motion states.
- [x] Verify production build, Sites package tests and repository Phase 0 checks.
- [x] Fix 125% equivalent viewport overflow.
- [x] Remove controller input privilege in code: adaptive keyboard/mouse/touch hints, pointer-mode detection, safe-area padding and coarse-pointer target floor.
- [ ] Recapture the latest narrow-layout build after browser access resumes.
- [ ] Run mouse, touch emulation and a real touchscreen primary-flow pass.
- [ ] Run a physical Xbox-layout and PlayStation-layout controller pass.
- [ ] Implement and profile one causal primary-action choreography using `engineering/MOTION-SYSTEM.md`.
- [ ] Obtain user visual acceptance before promoting any component into the production shell.

## Follow-up polish

- [P3] The source mock has a slightly larger luminous CTA and more transparent central HUD; these can be strengthened if the user wants more spectacle after checking motion in person.
- [P3] The top header can gain a quieter spatial-light treatment after performance measurement; it is intentionally solid and high-contrast in this first compatibility test.

final result: blocked
