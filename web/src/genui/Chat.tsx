import { FullScreen, createTheme } from "@openuidev/react-ui";
import { openAIAdapter } from "@openuidev/react-headless";
import { odetteLibrary } from "./library";
import { processMessage } from "./transport";

// Tint the OpenUI chat to the boutique palette (terracotta accent on cream).
const boutiqueTheme = {
  lightTheme: createTheme({
    interactiveAccentDefault: "oklch(0.58 0.11 47)",
    interactiveAccentHover: "oklch(0.52 0.11 47)",
    interactiveAccentPressed: "oklch(0.5 0.11 47)",
    textBrand: "oklch(0.58 0.11 47)",
  }),
};

/**
 * The Odette concierge chat, mounted inside the hero panel.
 * Powered by OpenUI's generative-UI runtime + our component library,
 * fed by the mock transport (swappable for the live Guild→OpenUI backend).
 */
export function OdetteChat() {
  return (
    <div className="chat-shell">
      <FullScreen
        agentName="Odette"
        logoUrl="/logo.png"
        showAssistantLogo
        componentLibrary={odetteLibrary}
        processMessage={processMessage}
        streamProtocol={openAIAdapter()}
        theme={boutiqueTheme}
        welcomeMessage={{
          title: "Bonjour, I'm Odette",
          description:
            "Tell me what you're looking for — I'll find the ones worth your while.",
        }}
        conversationStarters={{
          variant: "short",
          options: [
            {
              displayText: "A weekend bag under $200",
              prompt: "I'm looking for a weekend bag under $200",
            },
            {
              displayText: "A gift for a design lover",
              prompt: "Help me find a gift for a design lover",
            },
            {
              displayText: "Noise-cancelling headphones",
              prompt: "Recommend some noise-cancelling headphones",
            },
          ],
        }}
      />
    </div>
  );
}
