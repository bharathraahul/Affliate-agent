# Architecture — web frontend & chat

See also [tech-decisions.md](./tech-decisions.md), [brand-odette.md](./brand-odette.md), [team.md](./team.md).

## Frontend (`web/`)

- **Vite + React + TypeScript** SPA. Entry: `web/index.html` → `web/src/main.tsx` → `web/src/App.tsx`.
- The landing page (`App.tsx`) is the **Odette** boutique/concierge brand (see [brand-odette.md](./brand-odette.md)); styling in `web/src/styles.css`.
- Build: `npm run build` → `web/dist/`. Dev: `npm run dev`. (Replaced the old `npm start`/`build/` copy-script.)

## OpenUI generative-UI chat

Packages: `@openuidev/react-ui` (chat layouts + `createTheme`), `@openuidev/react-lang` (`defineComponent`/`createLibrary`), `@openuidev/react-headless` (`openAIAdapter`, types).

- **`web/src/genui/library.tsx`** — `createLibrary({ root: "Stack", components: [Stack, Text, ProductCard] })`. `ProductCard` renders a boutique card with an **affiliate buy button** (`tag=affliateagent-20`, matching `AFFILIATE_TAG` in `agent.ts`). Schemas use `zod/v4`.
- **`web/src/genui/Chat.tsx`** — mounts `<FullScreen>` from react-ui inside the hero panel, themed terracotta via `createTheme`, greeting as Odette, with conversation starters. Wired with `componentLibrary={odetteLibrary}`, `processMessage`, and `streamProtocol={openAIAdapter()}`.
- **`web/src/genui/transport.ts`** — the mock/real seam.

### The `processMessage` seam (mock today, Guild→OpenUI tomorrow)

OpenUI's chat calls `processMessage({ threadId, messages, abortController }) → Promise<Response>`. The `Response` body is an OpenAI-style SSE stream of text chunks; `openAIAdapter()` accumulates them into **OpenUI Lang**, which the component library renders.

- **`mockProcessMessage`** (active): streams a canned OpenUI Lang response (Odette's concierge line + 3 `ProductCard`s with real affiliate links). No backend required.
- **`liveProcessMessage`** (stubbed): `POST {VITE_CHAT_API_URL}/api/chat`. Selected when `VITE_USE_MOCK=false`. **Nothing in the UI changes** when swapping — only this file.

### Live backend contract (to build next — hybrid Guild → OpenUI)

A future Render **web service** exposing `POST /api/chat`:
1. Receives `{ threadId, messages }`.
2. Invokes **Bharath's Guild.ai agent** (`agent.ts`) for intent + product picks + affiliate links.
3. Formats the picks as **OpenUI Lang** (`Stack` of `ProductCard`s), streamed as OpenAI-format SSE.

**Open items for Bharath:**
- **Guild HTTP access:** how to invoke the deployed agent over HTTP is currently undocumented (Guild exposes CLI `guild session create` + web UI; no public REST endpoint found). Needed before `liveProcessMessage` works.
- **Persona:** `agent.ts`'s `systemPrompt` is a generic assistant — align it to Odette's voice so chat replies match the brand.

## Deploy (Render)

`render.yaml` (repo root): static site, `rootDir: web`, `buildCommand: npm run build`, `staticPublishPath: dist`, SPA rewrite `/* → /index.html`. Deploy via **New → Blueprint**. The Guild agent's root `package.json` is untouched (Render only builds inside `web/`).
