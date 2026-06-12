// Odette chat backend — the hybrid brain behind the OpenUI frontend.
// POST /api/chat  { threadId, messages } → OpenAI-style SSE stream of OpenUI Lang.
// Reuses the shopper-brain prompt from worker/poller.ts, but instructs the model
// to answer in OpenUI Lang (Stack/Text/ProductCard) so the web chat renders cards.
// Zero deps: plain Node 18+ (global fetch + http). Run: node server.js
import http from "node:http";

const {
  OPENROUTER_API_KEY,
  OPENROUTER_MODEL = "anthropic/claude-sonnet-4.5",
  PORT = "10000",
  ALLOWED_ORIGIN = "*",
} = process.env;

if (!OPENROUTER_API_KEY) {
  console.error("Missing OPENROUTER_API_KEY");
  process.exit(1);
}

const AFFILIATE_TAG = "affliateagent-20";

// Odette persona + the OpenUI Lang output contract (mirrors web/src/genui/library.tsx).
const SYSTEM_PROMPT = `You are Odette, a warm, sharp boutique personal-shopping
concierge. Speak with quiet taste — brief, charming, never salesy.

Your job, in order:
1. UNDERSTAND INTENT. Ask clarifying questions — at most 2-3 total, one at a
   time. Figure out: what they're buying, who it's for, budget, hard constraints.
2. RECOMMEND. Once you understand the need, recommend exactly 2-3 specific
   real products. For each: name, why it fits (one elegant sentence), an
   approximate price, and a purchase link (format below).
3. CLOSE. Ask if any pick looks right, or offer to refine.

OUTPUT FORMAT — you MUST reply ONLY in OpenUI Lang, nothing else. No markdown,
no prose outside the markup. The grammar:

root = Stack([name1, name2, ...])
name = Text("a line of concierge prose")
name = ProductCard("title", "$price", "imageUrl", "one-line rationale", "buyUrl")

- root must always be a Stack whose children are Text and/or ProductCard refs.
- When only conversing (e.g. a clarifying question), root is a Stack with a
  single Text child.
- ProductCard args are positional, in exactly that order.
- imageUrl: use https://picsum.photos/seed/<one-word-slug>/240/240 with a slug
  derived from the product (you cannot know real product images).
- buyUrl: https://www.amazon.com/s?k=<product+name+url+encoded>&tag=${AFFILIATE_TAG}
- Use approximate prices like "$120" or "$80–$120". Never mention tags/tracking.
- Stay on shopping; steer back gently if off-topic.

Example reply:
root = Stack([intro, p1, outro])
intro = Text("Two I think you'll love:")
p1 = ProductCard("Weekend Leather Holdall", "$189", "https://picsum.photos/seed/holdall/240/240", "Full-grain leather that ages beautifully.", "https://www.amazon.com/s?k=leather%20weekender%20bag&tag=${AFFILIATE_TAG}")
outro = Text("Shall I refine either of these?")`;

// Pull plain text out of an OpenUI Message regardless of exact shape
// ({content: string} | {content: [{type:'text', text}]} | {parts: [...]}).
function messageText(m) {
  if (typeof m?.content === "string") return m.content;
  const parts = Array.isArray(m?.content) ? m.content : Array.isArray(m?.parts) ? m.parts : [];
  return parts
    .map((p) => (typeof p === "string" ? p : p?.text ?? p?.value ?? ""))
    .filter(Boolean)
    .join("\n");
}

function toOpenAIMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .map((m) => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: messageText(m),
    }))
    .filter((m) => m.content)
    .slice(-12);
}

const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handleChat(req, res) {
  let body = "";
  for await (const chunk of req) body += chunk;
  let payload;
  try {
    payload = JSON.parse(body || "{}");
  } catch {
    res.writeHead(400, { ...CORS, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "invalid JSON" }));
  }

  const history = toOpenAIMessages(payload.messages);
  console.log(`[${new Date().toISOString()}] /api/chat thread=${payload.threadId} msgs=${history.length}`);

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      stream: true,
      max_tokens: 900,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error(`OpenRouter ${upstream.status}: ${detail.slice(0, 300)}`);
    res.writeHead(502, { ...CORS, "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: `upstream ${upstream.status}` }));
  }

  // OpenRouter already speaks OpenAI SSE — pipe it straight through.
  res.writeHead(200, {
    ...CORS,
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  const reader = upstream.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  } catch (e) {
    console.error("stream aborted:", e.message);
  } finally {
    res.end();
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }
  if (req.method === "GET" && req.url === "/healthz") {
    res.writeHead(200, { ...CORS, "Content-Type": "text/plain" });
    return res.end("ok");
  }
  if (req.method === "POST" && req.url === "/api/chat") {
    return handleChat(req, res).catch((e) => {
      console.error("handler failed:", e);
      if (!res.headersSent) res.writeHead(500, CORS);
      res.end();
    });
  }
  res.writeHead(404, CORS);
  res.end();
});

server.listen(Number(PORT), () =>
  console.log(`Odette chat backend on :${PORT} (model=${OPENROUTER_MODEL})`),
);
