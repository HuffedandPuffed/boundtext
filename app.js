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
              <option value="issn">ISSN to EAN-13</option>
              <option value="ismn">ISMN / Music EAN</option>
              <option value="ean13">EAN-13</option>
              <option value="ean8">EAN-8</option>
              <option value="upca">UPC-A</option>
              <option value="upce">UPC-E</option>
              <option value="code128">Code 128</option>
              <option value="code39">Code 39</option>
              <option value="itf14">ITF-14 carton code</option>
              <option value="interleaved2of5">Interleaved 2 of 5</option>
              <option value="datamatrix">Data Matrix</option>
              <option value="azteccode">Aztec Code</option>
              <option value="pdf417">PDF417</option>
              <option value="qrcode">QR Code</option>
            </select>
          </label>
          <label>
            <span>Value</span>
            <input id="barcode-input" autocomplete="off" value="978000000000">
          </label>
          <div class="split-actions">
            <button class="button primary" type="submit">Generate</button>
            <button class="button secondary" id="download-barcode" type="button">Download PNG</button>
          </div>
          <p class="quiet" id="barcode-message"></p>
          <details class="format-help">
            <summary>Accepted values for each format</summary>
            <dl>
              <dt>ISBN-13 / Bookland EAN</dt><dd>ISBN-10, 12 ISBN/EAN digits, or a valid 13-digit ISBN beginning 978 or 979.</dd>
              <dt>ISSN to EAN-13</dt><dd>Enter the 7 or 8 ISSN digits. The site converts it to a 977-prefixed EAN-13.</dd>
              <dt>ISMN / Music EAN</dt><dd>Enter 12 digits beginning 9790, or a valid 13-digit ISMN EAN beginning 9790.</dd>
              <dt>EAN-13</dt><dd>Enter 12 digits to add the check digit, or a valid 13-digit EAN.</dd>
              <dt>EAN-8</dt><dd>Enter 7 digits to add the check digit, or a valid 8-digit EAN-8.</dd>
              <dt>UPC-A</dt><dd>Enter 11 digits to add the check digit, or a valid 12-digit UPC-A.</dd>
              <dt>UPC-E</dt><dd>Enter 6 compressed digits, or 8 digits including number system and check digit.</dd>
              <dt>Code 128</dt><dd>Any ordinary text, numbers, SKU, batch code, URL, or internal reference.</dd>
              <dt>Code 39</dt><dd>Uppercase letters, numbers, spaces, and these symbols: - . $ / + %</== "code39">Code 39</option>
              <dt>ITF-14 carton code</dt><dd>Enter 13 digits to add the check digit, or a valid 14-digit GTIN/carton code.</dd>
              <dt>Interleaved 2 of 5</dt><dd>Numbers only, with an even number of digits.</dd>
              <dt>Data Matrix, Aztec Code, PDF417, QR Code</dt><dd>Any useful text such as a URL, ISBN, contact detail, product note, or inventory reference.</dd>
            </dl>
          </details>
        </form>
        <div class="barcode-preview">
          <canvas id="barcode-canvas" width="720" height="320" aria-label="Barcode preview"></canvas>
        </div>
      </section>
    `;
    const form = document.querySelector("#barcode-form");
    const type = document.querySelector("#barcode-type");
    const input = document.querySelector("#barcode-input");
    const message = document.querySelector("#barcode-message");
    const canvas = document.querySelector("#barcode-canvas");
    let autoGenerateTimer = 0;

    function generate(event) {
      if (event) event.preventDefault();
      const selectedType = type.value;
      let rawValue = input.value.trim();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Enforce clean, high-contrast solid white backing base layer for print scanning compliance
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!rawValue) {
        message.textContent = "Enter a value before generating.";
        return;
      }

      const isNumericType = ["isbn", "issn", "ismn", "ean13", "ean8", "upca", "upce", "itf14", "interleaved2of5"].includes(selectedType);
      if (isNumericType) {
        rawValue = rawValue.replace(/[- ]/g, "");
      }

      try {
        const isMatrix2D = ["qrcode", "datamatrix", "azteccode", "pdf417"].includes(selectedType);
        
        // Direct EAN-13 mapping for clean book blocks, leaving everything else native
        const targetBcid = selectedType === "isbn" ? "ean13" : selectedType;

        window.bwipjs.toCanvas(canvas, {
          bcid: targetBcid,
          text: rawValue,
          scale: 3,
          includetext: !isMatrix2D,
          textxalign: "center",
          backgroundcolor: "ffffff" 
        });
        message.textContent = `${type.options[type.selectedIndex].text} generated natively inside your secure repository layout.`;
      });
        message.textContent = `${type.options[type.selectedIndex].text} generated natively inside your secure repository layout.`;
      } catch (e) {
        message.textContent = "Invalid characters or data length configuration rules for the selected format standard.";
      }
    }

    form.addEventListener("submit", generate);
    
    function queueGenerate() {
      window.clearTimeout(autoGenerateTimer);
      autoGenerateTimer = window.setTimeout(() => generate(), 250);
    }

    type.addEventListener("change", generate);
    input.addEventListener("input", queueGenerate);
    
    document.querySelector("#download-barcode").addEventListener("click", () => {
      const cleanFileName = `barcode-${input.value.replace(/[^a-zA-Z0-9]/g, "") || "draft"}.png`;
      const link = document.createElement("a");
      link.download = cleanFileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
    
    generate();
  }

  function renderPrivate() {
    main.innerHTML = `
      <section class="page-hero private-hero">
        <p class="eyebrow">Private workspace</p>
        <h1>Draft file-management page.</h1>
        <p>${data.privatePage.warning}</p>
      </section>
      <section class="private-gate" id="private-gate">
        <form class="tool-panel" id="private-login">
          <label>
            <span>Password</span>
            <input id="private-password" type="password" autocomplete="current-password" placeholder="Prototype password">
          </label>
          <button class="button primary" type="submit">Open private page</button>
          <p class="quiet">For testing, edit <code>privatePage.demoPasswords</code> in <code>content.js</code>. This is still a client-side prototype, not real security.</p>
        </form>
      </section>
    `;
    document.querySelector("#private-login").addEventListener("submit", (event) => {
      event.preventDefault();
      const password = document.querySelector("#private-password").value;
      const allowed = data.privatePage.demoPasswords || [data.privatePage.demoPassword];
      if (allowed.includes(password)) renderPrivateWorkspace();
    });
  }

  function renderPrivateWorkspace() {
    const saved = localStorage.getItem("hp-private-notes") || "";
    document.querySelector("#private-gate").innerHTML = `
      <div class="private-workspace">
        <div>
          <h2>Catalogue notes</h2>
          <p class="quiet">Saved in this browser only. Use a real authenticated backend before storing private files.</p>
        </div>
        <textarea id="private-notes" rows="12" placeholder="Paste draft notes, cover status, ASINs, or upload reminders here.">${saved}</textarea>
        <div class="split-actions">
          <button class="button primary" id="save-notes" type="button">Save notes</button>
          <button class="button secondary" id="export-notes" type="button">Export notes</button>
        </div>
      </div>
    `;
    document.querySelector("#save-notes").addEventListener("click", () => {
      localStorage.setItem("hp-private-notes", document.querySelector("#private-notes").value);
    });
    document.querySelector("#export-notes").addEventListener("click", () => {
      const blob = new Blob([document.querySelector("#private-notes").value], { type: "text/plain" });
      const link = document.createElement("a");
      link.download = "bound-text-notes.txt";
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  function renderPaymentPlaceholder() {
    main.innerHTML = `
      <section class="page-hero">
        <p class="eyebrow">Direct sales</p>
        <h1>Payment page placeholder.</h1>
        <p>${data.company.directSalesNote}</p>
        <div class="payment-options">
          <article><h2>Stripe Payment Links</h2><p>Best for a simple card-payment link per book or bundle.</p></article>
          <article><h2>PayPal Checkout</h2><p>Fast to start, familiar to buyers, and useful for one-off signed-copy requests.</p></article>
          <article><h2>Shopify Starter</h2><p>Best if direct sales become a recurring catalogue with inventory and shipping rules.</p></article>
        </div>
      </section>
    `;
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

    if (route === "#authors") renderAuthors();
    else if (route === "#books") renderBooks(params.get("author") || "");
    else if (route === "#barcode") renderBarcode();
    else if (route === "#barcode-pro") renderBarcode();
    else if (route === "#private") renderPrivate();
    else if (route === "#payment-placeholder") renderPaymentPlaceholder();
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
