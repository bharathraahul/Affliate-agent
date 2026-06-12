import { OdetteChat } from "../genui/Chat";

/** Dedicated full-page concierge chat at /chat. */
export function ChatPage() {
  return (
    <div className="chat-page">
      <header className="nav">
        <div className="container nav__inner">
          <a className="brand" href="/">
            <img className="brand__mark" src="/logo.png" alt="Odette" />
            <span className="brand__name">Odette</span>
          </a>
          <nav className="nav__links">
            <a href="/">← Back to home</a>
          </nav>
        </div>
      </header>

      <main className="chat-page__main">
        <div className="container chat-page__inner">
          <OdetteChat />
          <p className="hero__panel-note">
            Live concierge chat — generative UI by OpenUI.
          </p>
        </div>
      </main>
    </div>
  );
}
