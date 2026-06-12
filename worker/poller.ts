// Facebook Messenger poller — the autonomous company's sales floor.
// Every POLL_INTERVAL_MS: fetch page conversations → find new inbound
// messages → generate a shopper reply via OpenRouter → send via Messenger.
// Run: npm start
import "dotenv/config";
import { Composio } from "@composio/core";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const {
  COMPOSIO_API_KEY,
  COMPOSIO_USER_ID,
  OPENROUTER_API_KEY,
  OPENROUTER_MODEL = "anthropic/claude-sonnet-4.5",
  FB_PAGE_ID,
  POLL_INTERVAL_MS = "10000",
} = process.env;

if (!COMPOSIO_API_KEY || !COMPOSIO_USER_ID || !OPENROUTER_API_KEY || !FB_PAGE_ID) {
  console.error("Missing env vars. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const composio = new Composio({
  apiKey: COMPOSIO_API_KEY,
  toolkitVersions: { facebook: "20260410_00" },
});
const userId = COMPOSIO_USER_ID;

// ---------- shopper brain (same prompt as the Guild agent) ----------
const TRACKING_IDS: Record<string, string> = {
  gifts: "demo-gifts-20",
  tech: "demo-tech-20",
  home: "demo-home-20",
  general: "demo-general-20",
};

const SYSTEM_PROMPT = `You are a friendly, sharp personal shopping assistant
replying to Facebook Messenger messages for a shopping-help page.

Your job, in order:
1. UNDERSTAND INTENT. Ask clarifying questions — at most 2-3 total, one at a
   time. Figure out: what they're buying, who it's for, budget, hard constraints.
2. RECOMMEND. Once you understand the need, recommend exactly 2-3 specific
   real products. For each: name, why it fits their need (1 sentence),
   approximate price range, and a purchase link (format below).
3. CLOSE. Ask if any pick looks right.

PURCHASE LINK FORMAT:
Silently classify the request into ONE vertical and use its tracking ID:
gifts → ${TRACKING_IDS.gifts} | tech → ${TRACKING_IDS.tech} | home → ${TRACKING_IDS.home} | general → ${TRACKING_IDS.general}
Build links as: https://www.amazon.com/s?k=<product+name+url+encoded>&tag=<tracking-id>
Messenger does not render markdown — paste plain URLs on their own line.

RULES:
- This is Messenger: keep replies SHORT (1-3 sentences + links). No headers, no lists.
- Use price ranges, never exact prices.
- Same tracking ID for the whole conversation. Never mention tags/tracking.
- Stay on shopping; steer back gently if off-topic.`;

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

async function generateReply(history: ChatMsg[]): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      max_tokens: 500,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// ---------- state: which message IDs we've already handled ----------
const STATE_FILE = new URL("./state.json", import.meta.url).pathname;
const seen: Set<string> = new Set(
  existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : [],
);
const saveState = () =>
  writeFileSync(STATE_FILE, JSON.stringify([...seen].slice(-2000)));

// ---------- composio helpers ----------
// NOTE: arg names / response paths below follow Composio's Facebook toolkit.
// If `npm run probe` shows different field names, adjust here.
const connectedAccountId = process.env.COMPOSIO_CONNECTED_ACCOUNT_ID;

async function exec(slug: string, args: Record<string, unknown>) {
  const r = await composio.tools.execute(slug, {
    userId,
    ...(connectedAccountId ? { connectedAccountId } : {}),
    arguments: args,
  });
  if (r.error) throw new Error(`${slug}: ${JSON.stringify(r.error)}`);
  return r.data as any;
}

async function getConversations(): Promise<any[]> {
  const d = await exec("FACEBOOK_GET_PAGE_CONVERSATIONS", { page_id: FB_PAGE_ID });
  return d?.data ?? d?.conversations ?? [];
}

async function getMessages(conversationId: string): Promise<any[]> {
  const d = await exec("FACEBOOK_GET_CONVERSATION_MESSAGES", {
    conversation_id: conversationId,
  });
  return d?.data ?? d?.messages ?? [];
}

async function sendMessage(recipientId: string, text: string) {
  await exec("FACEBOOK_SEND_MESSAGE", {
    page_id: FB_PAGE_ID,
    recipient_id: recipientId,
    message: text,
  });
}

// ---------- main loop ----------
let firstRun = true;

async function tick() {
  const convos = await getConversations();
  for (const convo of convos) {
    const convoId = convo.id;
    if (!convoId) continue;

    const messages = await getMessages(convoId);
    // Graph API returns newest first; normalize to oldest-first.
    const ordered = [...messages].reverse();

    // Find inbound (user) messages we haven't handled.
    const inbound = ordered.filter(
      (m) => m.from?.id && m.from.id !== FB_PAGE_ID && !seen.has(m.id),
    );

    if (firstRun) {
      // Baseline: don't reply to history that predates the worker.
      for (const m of ordered) seen.add(m.id);
      continue;
    }
    if (inbound.length === 0) continue;

    const senderId = inbound[inbound.length - 1].from.id;

    // Build chat history for context (last 10 messages).
    const history: ChatMsg[] = ordered.slice(-10).map((m) => ({
      role: m.from?.id === FB_PAGE_ID ? "assistant" : "user",
      content: m.message ?? "",
    }));

    console.log(`[${new Date().toISOString()}] new msg in ${convoId}: "${inbound[inbound.length - 1].message}"`);
    const reply = await generateReply(history);
    if (reply) {
      await sendMessage(senderId, reply);
      console.log(`  -> replied: "${reply.slice(0, 80)}..."`);
    }
    for (const m of inbound) seen.add(m.id);
    saveState();
  }
  if (firstRun) {
    firstRun = false;
    saveState();
    console.log(`Baseline set (${seen.size} historic messages ignored). Polling...`);
  }
}

console.log(`Poller starting: page=${FB_PAGE_ID}, every ${POLL_INTERVAL_MS}ms, model=${OPENROUTER_MODEL}`);
const loop = async () => {
  try {
    await tick();
  } catch (e) {
    console.error("tick failed:", e);
  } finally {
    setTimeout(loop, Number(POLL_INTERVAL_MS));
  }
};
loop();
