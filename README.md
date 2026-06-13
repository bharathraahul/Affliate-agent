# Odette: Autonomous Personal Shopper

Odette is an autonomous "company in a box" built for the June 2026 hackathon. It runs the full funnel end to end: ads bring people in, a landing page greets them, a conversational personal-shopper agent figures out what they actually want, and every product recommendation is monetized with affiliate-tagged purchase links.

The core idea is a personal shopper that discovers intent through conversation. Give it a vague need ("I need a gift for my dad"), a category ("best budget standing desk"), or a specific product question. It asks a few clarifying questions, narrows down budget and constraints, and recommends two or three specific products with buy links.

## Repository layout

This is a monorepo that doubles as a Guild.ai agent package.

```
affliate-link-agent/
  agent.ts        Guild llmAgent: the conversational personal-shopper core
  web/            Vite + React landing page and OpenUI generative-UI chat
  server/         Zero-dependency Node chat backend (POST /api/chat)
  worker/         Background jobs, including the Facebook Messenger poller
  docs/           Architecture, brand, team, and decision notes
  render.yaml     Render deploy blueprint (static web + node backend)
```

## Components

### Agent (`agent.ts`)

A Guild `llmAgent` in multi-turn mode. The system prompt walks the model through three steps: understand intent, recommend two or three real products, then close by asking if a pick fits. It silently classifies each request into a vertical (gifts, tech, home, or general) and builds Amazon purchase links with the matching tracking ID. Tracking IDs are placeholders today and need a real Amazon Associates tag before production.

### Web (`web/`)

A Vite, React, and TypeScript single-page app. The landing page carries the Odette boutique concierge brand. The chat experience uses OpenUI generative UI: `@openuidev/react-ui` for layout, `@openuidev/react-lang` for the component library, and `@openuidev/react-headless` for the OpenAI streaming adapter. A small component library (`Stack`, `Text`, `ProductCard`) renders concierge prose and boutique product cards with affiliate buy buttons.

The chat has a clean mock-or-live seam in `web/src/genui/transport.ts`. A mock path streams a canned response with no backend required, and a live path posts to the chat backend when `VITE_USE_MOCK=false`. Swapping between them changes only that one file.

### Server (`server/`)

A zero-dependency Node 18+ backend exposing `POST /api/chat`. It takes `{ threadId, messages }` and streams an OpenAI-style SSE response through OpenRouter. The system prompt makes the model reply only in OpenUI Lang (the `Stack`, `Text`, and `ProductCard` grammar the web library renders) and routes purchases across several affiliate merchants by vertical, for example Best Buy for electronics, Etsy for gifts, and Chewy for pets.

### Worker (`worker/`)

A Facebook Messenger poller that acts as the autonomous sales floor. On each interval it fetches page conversations through Composio, finds new inbound messages, generates a shopper reply via OpenRouter, and sends the reply back through Messenger.

## Getting started

### Web

```bash
cd web
npm install
npm run dev      # local dev server
npm run build    # production build to web/dist
```

### Server

```bash
cd server
OPENROUTER_API_KEY=your-key npm start
```

Environment variables: `OPENROUTER_API_KEY` (required), `OPENROUTER_MODEL` (defaults to `anthropic/claude-sonnet-4.5`), `PORT` (defaults to 10000), and `ALLOWED_ORIGIN` (defaults to `*`).

### Worker

```bash
cd worker
npm install
# copy .env.example to .env and fill it in
npm start        # run the poller
npm run probe    # one-off connection probe
```

Environment variables: `COMPOSIO_API_KEY`, `COMPOSIO_USER_ID`, `OPENROUTER_API_KEY`, and `FB_PAGE_ID` are required; `OPENROUTER_MODEL` and `POLL_INTERVAL_MS` are optional.

### Agent (Guild package)

```bash
npm install
npm run build    # compile, transform, and copy markdown
npm run bundle   # produce the gzipped agent bundle
npm run format   # prettier
```

## Deployment

`render.yaml` is a Render blueprint that provisions two services: a static site named `heyoddete` built from `web/` with a single-page-app rewrite, and a node service named `odette-chat-backend` built from `server/`. The backend reads `OPENROUTER_API_KEY` from the Render dashboard, and the frontend receives `VITE_CHAT_API_URL` from the backend service and `VITE_USE_MOCK=false`. Deploy through New, then Blueprint.

## Notes

Affiliate tracking IDs throughout the project are demo placeholders. Replace them with real merchant affiliate accounts before any live monetization.

## Team

Built by Bharath, Hansel, and Benjamin. See `docs/team.md` for more, and `docs/architecture.md` for a deeper look at the frontend and chat design.
