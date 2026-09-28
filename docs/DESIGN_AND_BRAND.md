# Design and brand notes

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Synthetic data only. Fyxer and the Fyxer logo are trademarks of their owner. They are used here only to identify the product this concept is about. No endorsement, partnership or access is implied.

## Why align to Fyxer's look at all

The lab is a conversation piece about Fyxer's onboarding, so a reviewer should be able to picture the treatment inside Fyxer's product. It also has to be impossible to mistake for Fyxer's product. So the design borrows the **public palette and type direction** and keeps a separate identity: its own name, its own mark and a permanent disclaimer.

## What was inspected (28 Sep 2026, public pages only)

| Item | Where it came from | What was found |
|---|---|---|
| Logo | `https://www.fyxer.com/images/brand/logos/fyxer-orange.webp` (also white, and "f" monogram variants) | Orange wordmark, 2020×723 px |
| Colour tokens | fyxer.com's public CSS custom properties | `--color-rb-orange-1: #ff5a39`, `orange-2: #e34a2b`, `orange-3: #c63d21`, `black: #101828`, `black-light: #1e1e1e`, `parchement-1: #f2f3e8`, `parchement-3: #c6c7bb`, `white: #fcfdfa`, `yellow-1: #ecd541`, `blue-1: #6981ff`, `blue-3: #3c51be`, `teal-3: #1e745d` |
| Logo pixel | Sampled from the downloaded wordmark | `rgb(255, 91, 58)`, which matches `orange-1` within rounding |
| Headline type | Computed style of the homepage `h1` | `f37Hybrid`, weight 600, 80/80 px, letter-spacing 0.8 px, colour `#101828`, with orange emphasis words |
| Body and button type | Computed style of the CTAs | `Poppins`, weight 600, background `#1e1e1e`, radius 8 px |
| Layout cues | Desktop and mobile screenshots | Parchment background, white rounded nav card, dark CTAs, compact mobile header |

## What the lab uses

| Choice | In the lab | Why |
|---|---|---|
| Palette | The tokens above, copied as values into `public/style.css` (`--ink`, `--btn`, `--bg`, `--orange*` and others). Light tints for labels and callouts are derived from them | Matches the public site. Nothing is hot-linked |
| Body and UI type | **Poppins**, vendored from `@fontsource/poppins` 5.2.7 (SIL Open Font License, `public/vendor/poppins.LICENSE`) | Poppins is the site's body font and is openly licensed |
| Headline type | **Poppins 600**, not f37Hybrid | f37Hybrid is a commercial typeface licensed to Fyxer. Copying it would need a licence, so the lab uses Poppins 600 with tighter tracking instead |
| Emphasis | Orange (`#ff5a39`) words inside dark-navy headlines, as on the homepage | Recognisable, low-cost cue |
| Buttons | `#1e1e1e`, radius 8 px, Poppins 600 | Matches the observed CTAs |
| Logo | The Fyxer wordmark appears **once**, top-left in the header, as a labelled subject: "Concept about [Fyxer] · Independent · Not affiliated · No endorsement". "First Value Lab" sits directly below as the concept title, and the navigation sits on the right. A 320 px copy is served from `public/brand/` | One clear hierarchy: the subject is named first and the concept title follows, so the page can't be mistaken for Fyxer's own. The logo isn't in the favicon, the mocks or the page title |
| Mock screens | Labelled "Illustrative mock, not Fyxer's UI", with the disclaimer inside the frame | Stops screenshots being taken out of context |

## Disclaimer placement (every view)

1. A sticky banner at the top of every route: "**Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Synthetic data only." On wider screens it adds no real OAuth, no email read or sent, no backend AI, no Fyxer data or metrics, and that the logo implies no endorsement.
2. The document `<title>` on every route.
3. Inside each simulator device frame and the before/after stage.
4. The footer, with the trademark notice.
5. The header of every Markdown document, and the `x-disclaimer` header on every API response.

`test/ui.test.ts` checks the banner, title and footer text. The Playwright pixel checks confirm the banner is visible at 1366×900 and 390×844 on every route.

## Accessibility

- Text colours meet WCAG AA on their backgrounds: navy `#101828` on parchment, white on `#1e1e1e`, and orange-3 `#c63d21` for small link text. Orange-1 is used only for large display text and decoration.
- Focus rings use `blue-1`. The before/after walkthrough respects `prefers-reduced-motion` and has a text version (see [storyboard](ANIMATION_STORYBOARD.md)).
