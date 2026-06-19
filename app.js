(function () {
  const data = window.HP_CONTENT;
  const main = document.querySelector("#main");
  const menuButton = document.querySelector(".menu-button");
  const menu = document.querySelector("#site-menu");
  const marketKey = "hp-marketplace";
  const defaultMarket = data.marketplaces.find((market) => market.default) || data.marketplaces[0];

  function iconArrow() {
    return document.querySelector("#icon-arrow").innerHTML;
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function detectMarketplace() {
    const saved = localStorage.getItem(marketKey);
    if (saved && data.marketplaces.some((market) => market.code === saved)) return saved;

    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/Australia|Pacific\/Auckland/i.test(zone)) return "AU";
    if (/Europe\/London|Europe\/Dublin/i.test(zone)) return "UK";
    if (/Europe\/Berlin|Europe\/Vienna|Europe\/Zurich/i.test(zone)) return "DE";
    if (/Europe\/Paris|Europe\/Brussels/i.test(zone)) return "FR";
    if (/Europe\/Rome/i.test(zone)) return "IT";
    if (/Europe\/Madrid/i.test(zone)) return "ES";
    if (/Asia\/Tokyo/i.test(zone)) return "JP";
    if (/America\/Toronto|America\/Vancouver|America\/Winnipeg|America\/Edmonton|America\/Halifax/i.test(zone)) return "CA";

    const locale = `${navigator.language || ""} ${navigator.languages ? navigator.languages.join(" ") : ""}`.toUpperCase();
    if (locale.includes("AU") || locale.includes("NZ")) return "AU";
    if (locale.includes("CA")) return "CA";
    if (locale.includes("GB")) return "UK";
    if (locale.includes("DE")) return "DE";
    if (locale.includes("FR")) return "FR";
    if (locale.includes("IT")) return "IT";
    if (locale.includes("ES")) return "ES";
    if (locale.includes("JP") || locale.includes("JA")) return "JP";
    return defaultMarket.code;
  }

  function getMarketplace() {
    const code = detectMarketplace();
    return data.marketplaces.find((market) => market.code === code) || defaultMarket;
  }

  function amazonUrl(book, market = getMarketplace()) {
    if (!book.asin) return "";
    return `https://${market.host}/dp/${book.asin}`;
  }

  function setRoute(route) {
    if (location.hash !== route) location.hash = route;
  }

  function getRouteParts() {
    const rawHash = location.hash || "#home";
    const [route, query = ""] = rawHash.split("?");
    return { route, params: new URLSearchParams(query) };
  }

  function renderMarketplaceSelect(className = "") {
    const current = getMarketplace().code;
    const hasManualOverride = Boolean(localStorage.getItem(marketKey));
    const currentMarket = data.marketplaces.find((market) => market.code === current) || defaultMarket;
    const options = data.marketplaces
      .map((market) => `<option value="${market.code}" ${market.code === current ? "selected" : ""}>${market.code}</option>`)
      .join("");
    return `
      <label class="market-select ${className}">
        <span>${hasManualOverride ? "Manual marketplace backup" : "Auto-detected Amazon marketplace"}</span>
        <small>${hasManualOverride ? `Customer preference override active: ${currentMarket.label}. Clear it to return to automatic detection.` : `Using ${currentMarket.label} from viewer timezone first, then browser language. Manual choice is only a backup if this is wrong.`}</small>
        <select data-marketplace>${options}</select>
        ${hasManualOverride ? `<button class="text-button" type="button" data-clear-marketplace>Use auto detection</button>` : ""}
      </label>
    `;
  }

  function coverArt(book) {
    if (book.coverImage) {
      return `
        <figure class="cover-image">
          <img src="${book.coverImage}" alt="${book.title} cover">
        </figure>
      `;
    }

    const author = data.authors.find((item) => item.name === book.author);
    const initials = author ? author.initials : "HP";
    return `
      <div class="cover-art cover-${slug(book.author)}">
        <span class="cover-kicker">${book.category}</span>
        <strong>${book.title}</strong>
        ${book.subtitle ? `<em>${book.subtitle}</em>` : ""}
        <small>${book.author}</small>
        <b>${initials}</b>
      </div>
    `;
  }

  function bookCard(book) {
    const market = getMarketplace();
    const buyUrl = amazonUrl(book, market);
    const directAvailable = data.directSales.enabled && book.direct;
    return `
      <article class="book-card" data-author="${book.author}" data-category="${book.category}">
        ${coverArt(book)}
        <div class="book-copy">
          <div class="book-meta">
            <span>${book.author}</span>
            <span>${book.category}</span>
          </div>
          <h3>${book.title}</h3>
          ${book.subtitle ? `<p class="subtitle">${book.subtitle}</p>` : ""}
          <p>${book.description}</p>
          ${book.status ? `<p class="status-pill">${book.status}</p>` : ""}
          <div class="book-actions">
            ${
              buyUrl
                ? `<a class="button primary" href="${buyUrl}" target="_blank" rel="noopener">Buy on Amazon ${market.code}${iconArrow()}</a>`
                : `<span class="button muted">Amazon link pending</span>`
            }
            ${
              directAvailable
                ? `<a class="button secondary" href="${data.directSales.paymentPageUrl}">${data.directSales.label}</a>`
                : ""
            }
          </div>
        </div>
      </article>
    `;
  }

  function renderHome() {
    const featured = data.books.slice(0, 4).map(bookCard).join("");
    main.innerHTML = `
      <section class="hero">
        <div class="hero-media" role="img" aria-label="Books and publishing desk"></div>
        <div class="hero-copy">
          <img class="hero-logo" src="assets/bt logo.png" alt="">
          <p class="eyebrow">Small press. Human voice. Useful sparks.</p>
          <h1>${data.company.name}</h1>
          <p>${data.company.intro}</p>
          <div class="hero-actions">
            <a class="button primary" href="#books">Browse books ${iconArrow()}</a>
            <a class="button secondary" href="#authors">Meet the authors</a>
          </div>
        </div>
      </section>
      <section class="section intro-band">
        <div>
          <p class="eyebrow">Current list</p>
          <h2>Character-led fiction, practical nonfiction, and word search books.</h2>
        </div>
        <p>${data.company.strapline}</p>
      </section>
      <section class="section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Featured books</p>
            <h2>Recently added and forthcoming titles</h2>
          </div>
          ${renderMarketplaceSelect()}
        </div>
        <div class="book-grid compact">${featured}</div>
      </section>
    `;
  }

  function renderAuthors() {
    main.innerHTML = `
      <section class="page-hero">
        <p class="eyebrow">Authors</p>
        <h1>Three voices, one compact publishing house.</h1>
        <p>These biographies are polished placeholders. Replace them in <code>content.js</code> when final author details and photos are ready.</p>
      </section>
      <section class="authors-list">
        ${data.authors
          .map(
            (author) => `
              <article class="author-panel" id="${author.id}">
               <div class="author-portrait">
  ${author.image 
    ? `<img src="${author.image}" alt="${author.name}">` 
    : `<span>${author.initials}</span>`
  }
</div>
                <div>
                  <p class="eyebrow">${author.role}</p>
                  <h2>${author.name}</h2>
                  <p>${author.bio}</p>
                  <p class="quiet">${author.note}</p>
                  <a class="text-link" href="#books?author=${encodeURIComponent(author.name)}">View ${author.name.split(" ")[0]}'s books ${iconArrow()}</a>
                </div>
              </article>
            `
          )
          .join("")}
      </section>
    `;
  }

  function renderBooks(filterAuthor = "") {
    const selectedAuthor = data.authors.some((author) => author.name === filterAuthor) ? filterAuthor : "";
    const booksForPage = selectedAuthor ? data.books.filter((book) => book.author === selectedAuthor) : data.books;
    const authors = ["All authors", ...data.authors.map((author) => author.name)];
    const categories = ["All categories", ...Array.from(new Set(booksForPage.map((book) => book.category)))];
    main.innerHTML = `
      <section class="page-hero books-hero">
        <div>
          <p class="eyebrow">Bookshop</p>
          <h1>${selectedAuthor ? `${selectedAuthor}'s books.` : "Bound Text."}</h1>
          <p>${selectedAuthor ? `Showing only titles by ${selectedAuthor}.` : "Amazon links are generated from each ASIN and the selected marketplace. Colin Bamforth titles also include a direct-purchase placeholder for stock you hold yourself."}</p>
        </div>
        ${renderMarketplaceSelect("inline")}
      </section>
      <section class="filters" aria-label="Book filters">
        ${
          selectedAuthor
            ? `<div class="locked-filter"><span>Author</span><strong>${selectedAuthor}</strong><a href="#books">View all books</a></div>`
            : `<label>
                <span>Author</span>
                <select id="author-filter">
                  ${authors.map((author) => `<option>${author}</option>`).join("")}
                </select>
              </label>`
        }
        <label>
          <span>Category</span>
          <select id="category-filter">
            ${categories.map((category) => `<option>${category}</option>`).join("")}
          </select>
        </label>
        <p class="filter-count" id="filter-count" aria-live="polite"></p>
      </section>
      <section class="book-grid all-books" id="book-results">
        ${booksForPage.map(bookCard).join("")}
      </section>
      <p class="no-results" id="no-results" hidden>No matching books found.</p>
    `;
    wireBookFilters(selectedAuthor);
  }

  function wireBookFilters(initialAuthor) {
    const authorFilter = document.querySelector("#author-filter");
    const categoryFilter = document.querySelector("#category-filter");
    const count = document.querySelector("#filter-count");
    const noResults = document.querySelector("#no-results");
    if (initialAuthor && authorFilter) authorFilter.value = initialAuthor;

    function apply() {
      const author = authorFilter ? authorFilter.value : initialAuthor;
      const category = categoryFilter.value;
      let visibleCount = 0;
      document.querySelectorAll(".book-card").forEach((card) => {
        const matchesAuthor = author === "All authors" || card.dataset.author === author;
        const matchesCategory = category === "All categories" || card.dataset.category === category;
        const isVisible = matchesAuthor && matchesCategory;
        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });
      count.textContent = `${visibleCount} ${visibleCount === 1 ? "book" : "books"} shown`;
      noResults.hidden = visibleCount !== 0;
    }

    [authorFilter, categoryFilter].filter(Boolean).forEach((input) => {
      input.addEventListener("input", apply);
      input.addEventListener("change", apply);
    });
    apply();
  }

  function cleanCode(value) {
    return value.toUpperCase().replace(/[^0-9X]/g, "");
  }

  function renderBarcode() {
    main.innerHTML = `
      <section class="page-hero">
        <p class="eyebrow">Barcode Maker</p>
        <h1>Barcode and QR code maker.</h1>
        <p>Create ISBN barcodes with genuine checksum validation, publishing codes, retail labels, internal inventory codes, and QR codes for public use.</p>
      </section>
      <section class="ad-slot" aria-label="Advertisement placeholder">
        <span>Google AdSense placement</span>
        <p>Reserved for a responsive ad unit once your AdSense publisher ID is ready.</p>
      </section>
      <section class="tool-layout">
        <form class="tool-panel" id="barcode-form">
          <label>
            <span>Barcode or QR format</span>
            <select id="barcode-type">
              <option value="isbn">ISBN-13 / Bookland EAN</option>
              <option value="issn">ISSN to EAN-13
