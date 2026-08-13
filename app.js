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
          <img src="${book.coverImage}" alt="Cover art for ${book.title}">
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
    const emailAddr = data.company.contactEmail || "contact@boundtext.com";
    const mailSubject = encodeURIComponent(`Signed Copy Request - ${book.title}`);
    const mailBody = encodeURIComponent(`Hi Colin,\n\nI would like to order a signed copy of ${book.title}. Please send payment details for direct bank transfer.\n\nThank you!`);
    const signedMailUrl = `mailto:${emailAddr}?subject=${mailSubject}&body=${mailBody}`;

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
          ${book.isbn ? `<p class="isbn-note" style="font-size: 14px; margin-top: 8px; color: var(--color-muted, #666);"><small><strong>ISBN:</strong> ${book.isbn} &mdash; Order from your local bookshop</small></p>` : ""}
          ${
            book.signedCopy
              ? `<p class="signed-note" style="font-size: 14px; margin-top: 8px; padding: 10px 14px; background: rgba(255, 92, 38, 0.08); border: 1px solid rgba(255, 92, 38, 0.25); border-radius: 8px;"><small><strong>Signed Copies Direct:</strong> Email <a href="${signedMailUrl}" style="text-decoration: underline;">${emailAddr}</a> to arrange a direct author-signed copy. Payment accepted via direct bank transfer.</small></p>`
              : ""
          }
          <div class="book-actions" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
            ${
              buyUrl
                ? `<a class="button primary" href="${buyUrl}" target="_blank" rel="noopener">Buy on Amazon ${market.code}${iconArrow()}</a>`
                : `<span class="button muted">Amazon link pending</span>`
            }
            ${
              book.signedCopy
                ? `<a class="button secondary" href="${signedMailUrl}">Order Signed Copy ✉</a>`
                : ""
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
          <img class="hero-logo" src="assets/bt logo tiny.webp" alt="Bound Text Publishing Logo">
          <p class="eyebrow">Small press. Human voice. Useful sparks.</p>
          <h1>${data.company.name}</h1>
          <p>${data.company.intro}</p>
          <div class="hero-actions">
            <a class="button primary" href="#books">Browse books ${iconArrow()}</a>
            <a class="button secondary" href="#authors">Meet the author</a>
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

  function renderAbout() {
    main.innerHTML = `
      <section class="page-hero">
        <p class="eyebrow">About Us</p>
        <h1>${data.company.name}</h1>
        <p>${data.company.intro}</p>
      </section>
      <section class="section" style="max-width: 800px; margin: 0 auto; padding-top: 20px;">
        <h2>Our Mission</h2>
        <p class="subtitle" style="font-size: 32px; font-style: italic; line-height: 1.4; margin-bottom: 24px; color: inherit;">
          ${data.company.strapline}
        </p>
        <p style="font-size: 18px; line-height: 1.6; color: inherit;">
          We are an independent publisher committed to delivering high-quality, character-led fiction, practical nonfiction, and engaging puzzle books directly to curious readers worldwide. We believe in keeping the list focused, the voice human, and the door open for compelling new ideas.
        </p>
        <br><br>
        <a class="button primary" href="#authors">Meet the author ${iconArrow()}</a>
      </section>
    `;
  }

  function renderContact() {
    main.innerHTML = `
      <section class="page-hero">
        <p class="eyebrow">Contact Us</p>
        <h1>Get in touch.</h1>
        <p>Whether you are a reader with a question or interested in signed copies, we would love to hear from you.</p>
      </section>
      <section class="section" style="text-align: center;">
        <h2>Enquiries</h2>
        <p>To receive updates, private announcements, or inquire about direct orders, drop us a line at:</p>
        <br>
        <p style="font-size: 24px; font-weight: bold;">
          <a href="mailto:contact@boundtext.com">contact@boundtext.com</a>
        </p>
      </section>
    `;
  }

  function renderAuthors() {
    main.innerHTML = `
      <section class="page-hero">
        <p class="eyebrow">Author & Publisher</p>
        <h1>Behind Bound Text Publishing.</h1>
        <p>Meet the mind behind our sharp-edged fiction, practical nonfiction, and engaging puzzle books.</p>
      </section>
      <section class="authors-list">
        ${data.authors
          .map(
            (author) => `
              <article class="author-panel" id="${author.id}">
                <div class="author-portrait">
                  ${author.image 
                    ? `<img src="${author.image}" alt="Portrait of ${author.name}">` 
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
          <p>${selectedAuthor ? `Showing titles by ${selectedAuthor}.` : "Amazon links are generated from each ASIN and the selected marketplace."}</p>
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

  function wireGlobalControls() {
    document.querySelectorAll("[data-marketplace]").forEach((select) => {
      select.addEventListener("change", (event) => {
        localStorage.setItem(marketKey, event.target.value);
        render();
      });
    });
    document.querySelectorAll("[data-clear-marketplace]").forEach((button) => {
      button.addEventListener("click", () => {
        localStorage.removeItem(marketKey);
        render();
      });
    });
  }

  function render() {
    const { route, params } = getRouteParts();
    document.querySelectorAll(".site-menu a").forEach((link) => {
      link.toggleAttribute("aria-current", link.getAttribute("href") === route);
    });
    menu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");

    if (route === "#about") renderAbout();
    else if (route === "#contact") renderContact();
    else if (route === "#authors") renderAuthors();
    else if (route === "#books") renderBooks(params.get("author") || "");
    else renderHome();

    wireGlobalControls();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    menu.classList.toggle("open", !expanded);
  });

  window.addEventListener("hashchange", render);
  render();
})();
