import { Suspense, lazy } from "react";
import { Home } from "./pages/Home";

// Lazy-loaded so the OpenUI runtime only downloads on /chat,
// keeping the landing page bundle small.
const ChatPage = lazy(() =>
  import("./pages/ChatPage").then((m) => ({ default: m.ChatPage })),
);

/**
 * Minimal path router — the Render SPA rewrite (/* → /index.html)
 * serves this app for every path, so /chat deep-links work in prod,
 * and Vite's dev server does the same locally.
 */
export function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/chat") {
    return (
      <Suspense fallback={null}>
        <ChatPage />
      </Suspense>
    );
  }
  return <Home />;
}
