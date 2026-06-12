import type { Message } from "@openuidev/react-headless";

/**
 * The mock / real backend seam for the OpenUI chat.
 *
 * The chat calls `processMessage(...)` and expects a `Response` whose body is an
 * OpenAI-style SSE stream of text chunks; `openAIAdapter()` (set as the chat's
 * `streamProtocol`) accumulates the chunks into OpenUI Lang, which the component
 * library renders.
 *
 * - mockProcessMessage: returns a canned, streamed OpenUI Lang response — used now.
 * - liveProcessMessage: POSTs to the real backend (hybrid Guild → OpenUI). Stubbed
 *   until that backend exists. Swap is controlled by VITE_USE_MOCK; nothing else
 *   in the UI changes.
 */

const AFFILIATE_TAG = "affliateagent-20";
const amazon = (query: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;

type ProcessMessageParams = {
  threadId: string;
  messages: Message[];
  abortController: AbortController;
};

// A canned concierge response in OpenUI Lang. Every child is a Text or
// ProductCard, matching the Stack child union in library.tsx.
const CANNED_OPENUI_LANG = `root = Stack([intro, p1, p2, p3, outro])
intro = Text("Voilà — three I've chosen with your taste in mind:")
p1 = ProductCard("Weekend Leather Holdall", "$189", "https://picsum.photos/seed/holdall/240/240", "Full-grain leather that ages beautifully — refined, never flashy.", "${amazon(
  "leather weekender bag",
)}")
p2 = ProductCard("Wireless Noise-Cancelling Headphones", "$248", "https://picsum.photos/seed/headphones/240/240", "Quiet luxury for the commute — warm sound, all-day comfort.", "${amazon(
  "noise cancelling headphones",
)}")
p3 = ProductCard("Automatic Field Watch", "$320", "https://picsum.photos/seed/watch/240/240", "An understated everyday piece — sapphire crystal, soft patina strap.", "${amazon(
  "automatic field watch",
)}")
outro = Text("Shall I refine any of these for you — or set a budget?")`;

function sseDataChunk(content: string): string {
  return `data: ${JSON.stringify({
    id: "mock",
    object: "chat.completion.chunk",
    choices: [{ index: 0, delta: { content }, finish_reason: null }],
  })}\n\n`;
}

function sseStopChunk(): string {
  return `data: ${JSON.stringify({
    id: "mock",
    object: "chat.completion.chunk",
    choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
  })}\n\n`;
}

function streamedMockResponse(): Response {
  const encoder = new TextEncoder();
  // Break the markup into small pieces to simulate token-by-token streaming.
  const pieces = CANNED_OPENUI_LANG.match(/[\s\S]{1,28}/g) ?? [CANNED_OPENUI_LANG];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const piece of pieces) {
        controller.enqueue(encoder.encode(sseDataChunk(piece)));
        await new Promise((resolve) => setTimeout(resolve, 38));
      }
      controller.enqueue(encoder.encode(sseStopChunk()));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

export async function mockProcessMessage(
  _params: ProcessMessageParams,
): Promise<Response> {
  // Small pause so the assistant feels like it's "considering".
  await new Promise((resolve) => setTimeout(resolve, 280));
  return streamedMockResponse();
}

export async function liveProcessMessage(
  params: ProcessMessageParams,
): Promise<Response> {
  // Hybrid backend (Guild picks → OpenUI Lang). Not built yet — see docs/architecture.md.
  const base = import.meta.env.VITE_CHAT_API_URL ?? "";
  return fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threadId: params.threadId, messages: params.messages }),
    signal: params.abortController.signal,
  });
}

const useMock = (import.meta.env.VITE_USE_MOCK ?? "true") !== "false";

export const processMessage = useMock ? mockProcessMessage : liveProcessMessage;
