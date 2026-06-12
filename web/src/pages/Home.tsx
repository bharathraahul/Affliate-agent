function Wordmark() {
  return (
    <a className="brand" href="/">
      <img className="brand__mark" src="/logo.png" alt="Odette" />
      <span className="brand__name">Odette</span>
    </a>
  );
}

/** Static chat preview in the hero — the real chat lives at /chat. */
function ChatPreview() {
  return (
    <a className="chat-shell chat-preview" href="/chat">
      <div className="chat">
        <div className="chat__header">
          <img className="chat__avatar" src="/logo.png" alt="" />
          Odette
        </div>
        <div className="chat__body">
          <div className="msg msg--bot">
            Bonjour — I'm Odette. What are you looking for today?
          </div>
          <div className="msg msg--user">A weekend bag under $200</div>
          <div className="msg msg--bot">
            Voilà — three I've chosen with your taste in mind…
          </div>
        </div>
        <div className="chat-preview__cta">
          <span className="btn btn--primary">Chat with Odette →</span>
        </div>
      </div>
    </a>
  );
}

export function Home() {
  return (
    <>
      <header className="nav">
        <div className="container nav__inner">
          <Wordmark />
          <nav className="nav__links">
            <a href="#how">How it works</a>
            <a href="#why">Why Odette</a>
            <a className="btn btn--ghost" href="/chat">
              Start shopping
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="container hero__inner">
            <div className="hero__copy">
              <p className="eyebrow">Your autonomous personal shopper</p>
              <h1>
                Tell Odette what you want.
                <br />
                She'll find it — and the <span className="accent">best deal</span>.
              </h1>
              <p className="lead">
                Odette is a personal concierge who actually talks with you,
                learns your taste and budget, then curates a short, considered
                edit — with the best price found for you. No endless tabs, no
                comparison spreadsheets. Just ask.
              </p>
              <div className="hero__cta">
                <a className="btn btn--primary btn--lg" href="/chat">
                  Chat with Odette
                </a>
                <a className="btn btn--ghost btn--lg" href="#how">
                  See how it works
                </a>
              </div>
              <p className="hero__note">No sign-up required to try.</p>
            </div>

            <div className="hero__panel">
              <ChatPreview />
              <p className="hero__panel-note">
                Live concierge chat — generative UI by OpenUI.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section" id="how">
          <div className="container">
            <div className="section__head">
              <h2>How it works</h2>
              <p className="section__sub">
                A concierge experience, start to finish.
              </p>
            </div>
            <div className="cards">
              <article className="card">
                <div className="card__num">1</div>
                <h3>Tell her your need</h3>
                <p>
                  Describe what you're after in plain language. The more you
                  share — taste, budget, occasion — the better she shops.
                </p>
              </article>
              <article className="card">
                <div className="card__num">2</div>
                <h3>She does the searching</h3>
                <p>
                  Odette weighs the options, compares the choices and narrows it
                  to a few that genuinely suit you.
                </p>
              </article>
              <article className="card">
                <div className="card__num">3</div>
                <h3>You get the edit</h3>
                <p>
                  Receive a curated short-list with direct links — ready to buy,
                  no second-guessing.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Why Odette */}
        <section className="section section--alt" id="why">
          <div className="container">
            <div className="section__head">
              <h2>Why Odette</h2>
              <p className="section__sub">Refined, personal, and always on.</p>
            </div>
            <div className="cards">
              <article className="card">
                <h3>Taste, not noise</h3>
                <p>
                  A considered short-list chosen for you — not a thousand search
                  results to wade through.
                </p>
              </article>
              <article className="card">
                <h3>Saves you the search</h3>
                <p>
                  She handles the comparing and the price-hunting, so you skip
                  the research rabbit hole.
                </p>
              </article>
              <article className="card">
                <h3>Personal, every time</h3>
                <p>
                  A real conversation that remembers what matters to you — warm,
                  refined, a little playful.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* The company that runs itself */}
        <section className="band">
          <div className="container band__inner">
            <div>
              <p className="band__eyebrow">The company that runs itself</p>
              <h2>Odette found 14 leads while you slept.</h2>
              <p>
                Odette isn't just a chat box — she's a self-operating company.
                She creates her own ad campaigns, greets the shoppers they bring
                in, understands them, and earns through the products she
                recommends.
              </p>
              <p>
                Scheduled jobs keep her working around the clock: launching fresh
                creatives, following up with quiet leads, and quietly retiring
                the campaigns that aren't paying off.
              </p>
            </div>
            <div className="stat-card">
              <div className="stat">
                <span className="stat__num">24/7</span>
                <span className="stat__label">
                  Always-on concierge — generating and serving demand while you
                  sleep.
                </span>
              </div>
              <div className="stat">
                <span className="stat__num">14</span>
                <span className="stat__label">
                  New leads engaged overnight from her own ad creatives.
                </span>
              </div>
              <div className="stat">
                <span className="stat__num">$0</span>
                <span className="stat__label">
                  Human hours required to keep the funnel running.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <div className="container">
            <h2>Ready to let Odette do your shopping?</h2>
            <a className="btn btn--primary btn--lg" href="/chat">
              Chat with Odette
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <Wordmark />
          <span className="footer__copy">© 2026 Odette · heyoddete.com</span>
        </div>
      </footer>
    </>
  );
}
