# Brand — Odette

Single source of truth for Odette's persona, voice, and visual system. Keep the landing page, ad creatives, and Odette's chat replies consistent with this. See also [project-idea.md](./project-idea.md), [architecture.md](./architecture.md).

## Who / what
Odette is an autonomous AI personal shopper that runs as a **self-operating company** — she generates her own customers (ad creatives), serves them (concierge chat), and monetizes them (affiliate links; lead resale to businesses as roadmap), with scheduled jobs keeping her alive 24/7. Domain **heyoddete.com**; hook **"Hey Odette."**

## Persona & voice
French luxury concierge — **warm, refined, personal, slightly playful**. A character, not a dashboard; not cold corporate AI. Light French touches ("Bonjour", "Voilà") used sparingly. She understands taste, budget, and intent, then curates a short, considered edit.

## Copy
- **Hero (shopper-facing):** "Tell Odette what you want. She'll find it — and the best deal." CTA: **"Chat with Odette."**
- **Chat greeting:** "Bonjour, I'm Odette. Tell me what you're looking for — I'll find the ones worth your while."
- **Autonomy / brand story (secondary band):** "The company that runs itself." · "Odette found 14 leads while you slept."
- **How it works:** understands your taste → curates a short edit → you choose.

## Visual system (from `updated-style.png`)
Premium, human, boutique/concierge — implemented in `web/src/styles.css`.

| Token | Value | Use |
|---|---|---|
| `--cream` | `#f4ede1` | page canvas |
| `--surface` | `#fbf7ef` | cards / chat |
| `--ink` | `#2e2a25` | text |
| `--ink-soft` | `#6f6658` | muted text |
| `--terra` | `#c0653c` | accent (buttons, links, emblem) |
| `--terra-dark` | `#a8542f` | accent hover |
| `--terra-tint` | `#ecd9c5` | user chat bubble / soft fills |
| `--border` | `#e6dccb` | hairline borders |

- **Type:** display = **Fraunces** (serif, headings + wordmark); body = **Inter** (sans). Soft rounded cards (16px), generous whitespace, gentle shadows.
- **Wordmark:** lowercase "heyoddete" + a small line-art emblem (see `web/public/favicon.svg`).
- The embedded OpenUI chat is themed terracotta via `createTheme` to match.

## Audience note
The public page is where ad leads land → **hero is shopper-facing concierge**; the "company that runs itself" story is a **secondary band**, not the headline. Swap if leading with the autonomy pitch.
