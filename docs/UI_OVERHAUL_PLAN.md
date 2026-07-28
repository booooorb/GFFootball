# GFFootball Visual UI Overhaul Plan

## North star

Redesign GFFootball as **festival broadcast × collectible football**:

- The app shell should feel calm, premium, and easy to scan.
- World Tournament energy should come from bold red/green/blue poster fragments,
  cultural collage, field graphics, big numerals, and human portraiture.
- Player items should use the recognizable information hierarchy of football
  collectibles—OVR, position, portrait, name, rarity, and stats—inside an
  original card frame.
- The design must not use or copy FIFA, EA SPORTS FC, World Cup, national-team,
  trophy, or Ultimate Team logos and proprietary card frames.

The World Cup 2026 identity is most useful here as a system, not a skin: one
shared tournament structure with enough visual flexibility for every generated
theme to feel like its own host-city identity.

## 1. Current experience audit

### Keep

- Sticky global status with balance, AI state, and season progress.
- Clear setup-to-squad-to-match progression.
- Desktop pitch plus squad-list split.
- Formation control, best-XI helper, player filtering, and sorting.
- Click and drag lineup assignment.
- Explicit scouting cost, transfer pricing, and resale value.
- Match results, performance map, stats, timeline, standings, and fixtures.
- Keyboard semantics, dialogs, live regions, and reduced-motion support.

### Improve

1. **Player identity is too quiet.** The current squad rows and transfer cards are
   practical but do not make generated characters feel collectible.
2. **All emphasis uses the same lime accent.** Selection, money, readiness, and
   primary actions compete visually.
3. **The command area is dense.** Scouting, formation, and market controls appear
   as one continuous utility strip with weak grouping.
4. **Important player decisions are mixed with maintenance actions.** Photo
   cycling, avatar fallback, and selling all sit in the primary row scan path.
5. **The mobile layout is a long stack.** Pitch, squad, matchday, and ledger need
   clearer mode changes and sticky context.
6. **Transfer reveal lacks spectacle.** The market should be the moment where the
   generative premise feels most rewarding.

## 2. Visual system

### 2.1 Palette

Use a quiet neutral foundation:

| Token | Value | Use |
| --- | --- | --- |
| Ink 950 | `#080A0C` | Page background |
| Ink 900 | `#101419` | Major panels |
| Ink 850 | `#171D23` | Raised controls |
| Paper 50 | `#F7F3EA` | Primary text/light item field |
| Paper 200 | `#DDD8CE` | Subtle light borders |
| Steel 400 | `#8D99A6` | Secondary text |

Add a restrained tournament spectrum:

| Token | Value | Use |
| --- | --- | --- |
| Canada red | `#F04454` | Alerts, red card fragments, one card family |
| Mexico green | `#16A66A` | Positive states, one card family |
| USA blue | `#2867E8` | Navigation/selected section, one card family |
| Sun yellow | `#F4C74B` | Value, rarity, match highlights |
| Signal cyan | `#45D7E8` | Secondary data visualization |

Rules:

- One tournament color dominates a section or player item.
- Other colors appear only as thin rails, small marks, or poster fragments.
- Do not apply multicolor gradients to large panels.
- Do not rely on red versus green alone for state.

### 2.2 Typography

- Keep the current condensed display stack for titles, ratings, and scores.
- Keep Inter/system UI for instructions, player names, and actions.
- Keep the monospaced stack only for money, stats, phase labels, and compact data.
- Increase normal body copy to at least 14px desktop and 15px mobile.
- Use uppercase sparingly: short broadcast labels, not paragraphs.

### 2.3 Graphic language

- Very subtle topographic or field-grid texture on the app background.
- Flat poster fragments: halftone dots, clipped stripes, cropped arcs, stars,
  maple-leaf-like angular geometry, and abstract cultural marks.
- Do not use literal official symbols.
- Use cut-paper overlap around hero moments and transfer items.
- Keep texture below 5% opacity behind functional content.

### 2.4 Shape and depth

- App panels: 16px radius.
- Controls: 10px radius.
- Status chips: full pill.
- Collectible items: original chamfered/octagonal silhouette.
- Default surfaces use a one-pixel border and minimal shadow.
- Hovered player items lift no more than 4px.
- Foil is a reveal/hover effect, not a permanent glow.

## 3. Information architecture

### 3.1 Global match-centre bar

Desktop:

- Left: GFFootball mark and `Squad Room`.
- Center: `Season 2 · Week 3` and next opponent.
- Right: `€84m`, `7 pts`, AI status, help/profile.

Mobile:

- Keep only mark, balance, and points visible.
- Place AI detail and lower-priority status in an overflow sheet.

### 3.2 Club command strip

Split the controls into three labeled groups:

1. **Scout a theme** — input, cost, and primary action.
2. **Tactics** — formation and `Pick best XI`.
3. **Transfers** — available-player count and free-transfer badge.

Give each group its own spacing and divider. Keep labels visible. State the cost
inside the button: `Scout 10 · costs €20m`.

### 3.3 Squad workspace

Desktop:

- Pitch: 60% of the workspace.
- Squad browser: 40%.
- Selected player can open a slim contextual inspector without moving the pitch.
- Filters remain at the top of the squad column.

Tablet:

- Stack pitch above squad but keep the command strip accessible.

Mobile:

- Use a sticky segmented control: `Lineup (11)` / `Squad (18)`.
- Show one surface at a time.
- Keep a selected-player action tray above the bottom edge.
- Never require drag and drop; tap-select then tap-slot remains the main fallback.

## 4. Player item system

Create four related components instead of forcing one card to serve every context.

### 4.1 Pitch item

Purpose: fast recognition and lineup manipulation.

- Width: 84–112px desktop; 62–78px mobile.
- Top-left: large OVR with position immediately below.
- Middle: portrait taking 60–65% of the item.
- Bottom: short uppercase name ribbon.
- Selected: check marker plus strengthened border.
- Compatible: animated outline plus visible `Compatible` label/icon.
- Out of position: show `CM → AM` and effective OVR.

Do not add six detailed attributes to this size.

### 4.2 Squad row

Purpose: compare players quickly.

- 68px portrait.
- Name first; generated theme second.
- OVR and position anchored on the right.
- Market value should be stronger than historical totals.
- Default stat line: season appearances/average plus the position-relevant pair
  of stats.
- `Starting XI` becomes a labeled badge.
- Move `Next photo`, `Avatar`, and `Sell` into an overflow/action menu.
- Expanded/detail state can show career versus season totals.

### 4.3 Transfer item

Purpose: spectacle plus a clear financial decision.

- Original chamfered collectible frame.
- Large portrait over a theme-derived poster-collage background.
- OVR and position form a consistent top-left stack.
- Name uses a high-contrast lower banner.
- Clearly separate:
  - asking price,
  - projected resale,
  - free-transfer status,
  - affordability.
- One full-width primary CTA: `Sign free` or `Buy €80m`.
- Disabled state explains `Need €16m more` rather than only reducing opacity.

### 4.4 Player detail

Purpose: deeper inspection and management.

- Large item art on the left; facts/actions on the right.
- Career and current-season tabs.
- Formation compatibility and effective OVR.
- Market value, sell action, and portrait tools.
- Optional football attributes live here:
  `PAC, SHO, PAS, DRI, DEF, PHY`.

### 4.5 Rarity tiers

| Tier | Treatment |
| --- | --- |
| Base | Paper/steel body with one tournament-color rail |
| In form | Ink body, yellow edge, subtle scoreline texture |
| Icon | Warm ivory body, deep navy type, restrained gold foil |
| Theme legend | Two-color poster collage derived from the generated theme |

Every tier keeps OVR, position, name, and CTA in the same locations.

## 5. Screen-by-screen redesign

### 5.1 Setup

- Replace the left-copy/right-empty-pitch split with a stronger event-opening
  composition.
- Keep the prompt as the visual focal point.
- Show three concise steps above it:
  `Choose a world → Build an XI → Play the season`.
- Formation choices use miniature field diagrams rather than radio text alone.
- The preview pitch displays blurred/locked collectible silhouettes to foreshadow
  the reward.
- Primary CTA remains explicit about the €20m cost.

### 5.2 Squad room

- Reduce the oversized `Squad room` heading so the pitch enters the viewport sooner.
- Use the redesigned global bar and command strip.
- Keep the pitch visually dominant.
- Convert pitch players to the small collectible item.
- Simplify squad rows and expose deeper information on selection.
- Keep `11 / 11` near the pitch title and change it to `Ready` when complete.

### 5.3 Transfer market

- Make the dialog feel like a scouting-report reveal rather than a utility modal.
- Top summary becomes four digestible chips:
  `10 targets`, `3 free`, `€84m balance`, `75% resale`.
- Transfer items become the primary visual moment.
- Show a brief staggered reveal with a `Skip reveal` control.
- Keep price and affordability visible before hover.

### 5.4 Matchday and result

- Matchday strip becomes a broadcast matchup:
  club versus opponent, week, venue/flavor line, readiness, primary CTA.
- Result dialog begins with the score and outcome.
- Performance pitch keeps the current formation mapping.
- Statistics use paired horizontal comparison bars.
- Timeline and rating table remain available below.
- Player-of-the-match uses the larger item treatment.

### 5.5 Season ledger

- Use a compact broadcast table with a stronger highlight for the user club.
- Turn the six fixtures into a horizontal match ticker on desktop.
- On mobile, show completed/next/upcoming groups.
- Keep reset as a low-emphasis destructive action at the very end.

## 6. Interaction and motion

- Standard UI transitions: 140–180ms ease-out.
- Player-item hover: 180–240ms and maximum 4px lift.
- Pack reveal: 480–650ms stagger; always skippable.
- Signing: short border lock and confirmation sweep, under 650ms.
- Scouting progress:
  `Reading theme → Building XI → Finding portraits`.
- Match simulation: short scoreboard countdown, then score reveal.
- With reduced motion, replace all movement with immediate border/content changes.

## 7. Accessibility and clarity requirements

- WCAG AA contrast for all essential text and controls.
- Minimum target size: 44×44px.
- Keep semantic buttons, form labels, dialogs, tables, and live regions.
- Include a visible focus state on every card and pitch slot.
- Use icon + label for selection, starter, compatible, rarity, warning, and error.
- Never make drag-and-drop the only route to a valid lineup.
- Use explicit financial labels: `Scouting cost`, `Asking price`,
  `Projected resale`, `Club balance`.
- Avoid important text over busy collage regions; use solid backing ribbons.

## 8. Implementation sequence

### Phase 0 — Tokens and safe foundations

Files:

- `fantasy-football/styles.css`
- `fantasy-football/index.html`

Tasks:

- Add the neutral and tournament color tokens.
- Normalize type sizes, radii, focus rings, and spacing.
- Build background texture utilities.
- Preserve the current selectors while introducing new modifier classes.

Exit criteria:

- Existing UI still works with no JavaScript changes.
- Contrast and focus states pass a manual audit.

### Phase 1 — Shell and squad workspace

Files:

- `fantasy-football/index.html`
- `fantasy-football/styles.css`

Tasks:

- Rework top bar and command groups.
- Adjust manager heading and 60/40 workspace.
- Add mobile `Lineup / Squad` view switch markup.
- Restyle pitch and empty slots.

Exit criteria:

- Primary task is visible without scrolling at 1440×900.
- Mobile user can reach lineup and squad in one tap.

### Phase 2 — Player items

Files:

- `fantasy-football/js/main.js`
- `fantasy-football/styles.css`

Tasks:

- Update `pitchPlayerMarkup`.
- Update `collectionPlayerMarkup`.
- Add selection/starter/compatibility labels.
- Move maintenance actions into a menu/detail state.
- Define reusable rarity modifier classes.

Exit criteria:

- OVR, position, name, value, and state remain scannable.
- Mouse, keyboard, touch, and drag/click assignment all work.

### Phase 3 — Transfers and match centre

Files:

- `fantasy-football/index.html`
- `fantasy-football/js/main.js`
- `fantasy-football/styles.css`

Tasks:

- Redesign `renderTransferMarketDialog`.
- Add summary chips and explanatory disabled states.
- Restyle scoreboard, performance map, stat comparison, timeline, and ratings.
- Add restrained reveal/signing motion.

Exit criteria:

- Free, paid, affordable, and unaffordable targets are unmistakable.
- Results remain usable with reduced motion and keyboard navigation.

### Phase 4 — Setup, ledger, responsive, and polish

Files:

- `fantasy-football/index.html`
- `fantasy-football/styles.css`
- `fantasy-football/js/main.js`
- `fantasy-football/tests/*.test.js` where logic coverage applies

Tasks:

- Rework setup story and formation previews.
- Restyle standings and fixture ticker.
- Complete 1160px, 900px, and 650px responsive states.
- Audit long names, missing portraits, empty states, errors, and loading.
- Test contrast, focus order, reduced motion, and 320px width.

Exit criteria:

- No clipped player names or controls at 320px.
- All existing functional tests pass.
- Every user-visible app state has a designed loading, empty, success, and error state.

## 9. Recommended first implementation slice

Start with the populated squad room and three player-item contexts:

1. global bar and command strip,
2. pitch item,
3. squad row,
4. transfer item.

This slice establishes nearly every visual token and validates the central
tradeoff—collectible spectacle versus tactical readability—before investing in
the setup and match-result surfaces.

## 10. Final acceptance checklist

- [ ] The next action is obvious on setup, squad, transfer, and match screens.
- [ ] Balance, points, formation, and lineup readiness are glanceable.
- [ ] Pitch, squad, and transfer items feel related but fit their context.
- [ ] Player-item frames are original and do not copy protected product assets.
- [ ] Red/green/blue tournament cues never overwhelm content.
- [ ] All important states use text/icon cues in addition to color.
- [ ] Desktop squad-building is fast at 1440×900.
- [ ] Mobile uses intentional `Lineup / Squad` modes.
- [ ] Keyboard and tap alternatives exist for every drag action.
- [ ] Reduced-motion behavior is complete.
- [ ] No existing game, finance, portrait, season, or result behavior is removed.

