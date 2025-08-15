/* pages/reviews.js
   - Builds an "All Reviews" page
   - Groups cards by domain using data/reviews.json
   - No filters/sorting yet (future)
*/
(async () => {
  const TITLE = "Reviews";
  document.title = `EverydayMathReviews.com — ${TITLE}`;

  // Build the full shell
  document.body.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>

    <header class="site-header">
      <div class="wrap">
        <h1 class="site-title">EverydayMathReviews.com</h1>
        <nav class="primary-nav" aria-label="Primary">
          <ul>
            <li><a href="about.html">About</a></li>
            <li><a href="games.html">Games</a></li>
            <li><a href="movies.html">Movies</a></li>
            <li><a href="sewing.html">Sewing</a></li>
            <li><a href="music.html">Music</a></li>
            <li><a href="art.html">Art</a></li>
            <li><a aria-current="page" href="reviews.html">Reviews</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main id="main" class="wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href="about.html">Home</a></li>
          <li aria-current="page">${EMR.escape(TITLE)}</li>
        </ol>
      </nav>

      <h2 class="page-title">${EMR.escape(TITLE)}</h2>
      <p class="domain-intro">
        All reviews, grouped by domain. Open a card to see full details, including what 1★ and 5★ mean for each category.
      </p>

      <div id="sections"></div>
    </main>

    <footer class="site-footer">
      <div class="wrap">
        <p>© <span id="year"></span> EverydayMathReviews.com</p>
      </div>
    </footer>
  `;

  const sections = document.getElementById("sections");

  try {
    const data = await EMR.fetchJSON("data/reviews.json");
    const domains =
      data.meta && Array.isArray(data.meta.domains)
        ? data.meta.domains
        : ["games", "movies", "sewing", "music", "art"];

    const reviews = Array.isArray(data.reviews) ? data.reviews : [];

    // Build each domain section (skip empty domains gracefully)
    sections.innerHTML =
      domains
        .map((domain) => {
          const list = reviews.filter((r) => r.domain === domain);
          if (!list.length) return "";

          const titleMap = {
            games: "Games",
            movies: "Movies",
            sewing: "Sewing",
            music: "Music",
            art: "Art",
          };
          const sectionTitle = titleMap[domain] || domain;

          const cards = list.map(EMR.renderCard).join("");
          return `
        <section aria-labelledby="sec-${domain}" style="margin-top: var(--space-7);">
          <h3 id="sec-${domain}">${EMR.escape(sectionTitle)}</h3>
          <div class="card-grid">${cards}</div>
        </section>
      `;
        })
        .join("") || "<p>No reviews available yet.</p>";

    // Wire disclosures for all sections (event delegation)
    sections.addEventListener("click", (e) => {
      const btn = e.target.closest("button.expand-btn");
      if (!btn) return;
      const card = btn.closest(".card");
      const region = card.querySelector(".expand");
      const primaryBtn = card.querySelector(
        `.expand-btn[aria-controls="${region.id}"]`
      );

      const collapse = btn.hasAttribute("data-collapse");
      const isOpen = region.getAttribute("data-open") === "true";
      const next = collapse ? false : !isOpen;

      region.setAttribute("data-open", String(next));
      if (primaryBtn) {
        primaryBtn.setAttribute("aria-expanded", String(next));
        primaryBtn.textContent = next ? "Hide full review" : "View full review";
      }
      if (collapse) primaryBtn?.focus();
    });
  } catch {
    sections.innerHTML = `<p>Sorry, something went wrong loading reviews.</p>`;
  }
})();
