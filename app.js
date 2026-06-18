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
          <img class="hero-logo" src="assets/hp-logo.jpg" alt="">
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

  function ean13Checksum(firstTwelve) {
    const sum = firstTwelve
      .split("")
      .map(Number)
      .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 1 : 3), 0);
    return String((10 - (sum % 10)) % 10);
  }

  function isbn10Checksum(firstNine) {
    const sum = firstNine
      .split("")
      .map(Number)
      .reduce((total, digit, index) => total + digit * (10 - index), 0);
    const remainder = 11 - (sum % 11);
    if (remainder === 10) return "X";
    if (remainder === 11) return "0";
    return String(remainder);
  }

  function upcChecksum(firstEleven) {
    const sum = firstEleven
      .split("")
      .map(Number)
      .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
    return String((10 - (sum % 10)) % 10);
  }

  function ean8Checksum(firstSeven) {
    const sum = firstSeven
      .split("")
      .map(Number)
      .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
    return String((10 - (sum % 10)) % 10);
  }

  function gs1Checksum(digitsWithoutCheck) {
    const reversed = digitsWithoutCheck.split("").reverse().map(Number);
    const sum = reversed.reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
    return String((10 - (sum % 10)) % 10);
  }

  function cleanCode(value) {
    return value.toUpperCase().replace(/[^0-9X]/g, "");
  }

  function isbn10To13(value) {
    const raw = cleanCode(value);
    if (raw.length !== 10) return null;
    const body = raw.slice(0, 9);
    if (isbn10Checksum(body) !== raw[9]) return null;
    const firstTwelve = `978${body}`;
    return firstTwelve + ean13Checksum(firstTwelve);
  }

  function isbn13To10(value) {
    const raw = cleanCode(value);
    if (raw.length !== 13 || !raw.startsWith("978") || ean13Checksum(raw.slice(0, 12)) !== raw[12]) return null;
    const body = raw.slice(3, 12);
    return body + isbn10Checksum(body);
  }

  function normalizeBookBarcode(type, value) {
    const raw = cleanCode(value);
    if (type === "isbn13") {
      if (raw.length === 10) return isbn10To13(raw);
      if (raw.length === 12) return raw + ean13Checksum(raw);
      if (raw.length === 13 && (raw.startsWith("978") || raw.startsWith("979")) && ean13Checksum(raw.slice(0, 12)) === raw[12]) return raw;
      return null;
    }
    if (type === "issn") {
      const base = raw.length >= 8 ? raw.slice(0, 7) : raw.slice(0, 7);
      if (base.length !== 7) return null;
      const firstTwelve = `977${base}00`;
      return firstTwelve + ean13Checksum(firstTwelve);
    }
    if (type === "ismn") {
      const digits = raw.replace(/X/g, "");
      if (digits.length === 12) return digits + ean13Checksum(digits);
      if (digits.length === 13 && digits.startsWith("9790") && ean13Checksum(digits.slice(0, 12)) === digits[12]) return digits;
      return null;
    }
    if (type === "upca") {
      const digits = raw.replace(/X/g, "");
      if (digits.length === 11) return `0${digits}${upcChecksum(digits)}`;
      if (digits.length === 12 && upcChecksum(digits.slice(0, 11)) === digits[11]) return `0${digits}`;
      return null;
    }
    return raw;
  }

  function validateServiceBarcode(type, value) {
    const digits = cleanCode(value).replace(/X/g, "");
    const text = value.trim();

    if (type === "ean8") {
      if (digits.length === 7) return { value: digits + ean8Checksum(digits), message: "Check digit added for EAN-8." };
      if (digits.length === 8 && ean8Checksum(digits.slice(0, 7)) === digits[7]) return { value: digits, message: "Valid EAN-8 generated." };
      return { error: "EAN-8 must be 7 digits plus a calculated check digit, or 8 valid digits. ISBN/EAN-13 values are outside the EAN-8 range." };
    }

    if (type === "upca") {
      if (digits.length === 11) return { value: digits + upcChecksum(digits), message: "Check digit added for UPC-A." };
      if (digits.length === 12 && upcChecksum(digits.slice(0, 11)) === digits[11]) return { value: digits, message: "Valid UPC-A generated." };
      return { error: "UPC-A must be 11 digits plus a calculated check digit, or 12 valid digits. ISBN/EAN-13 values are outside the UPC-A range." };
    }

    if (type === "upce") {
      if (digits.length === 6 || digits.length === 8) return { value: digits, message: "UPC-E generated. Use 6 compressed digits, or 8 digits including number system and check digit." };
      return { error: "UPC-E is a compressed UPC format and usually needs 6 digits, or 8 digits including number system and check digit. ISBN/EAN-13 values are outside the UPC-E range." };
    }

    if (type === "itf14") {
      if (digits.length === 13) return { value: digits + gs1Checksum(digits), message: "Check digit added for ITF-14." };
      if (digits.length === 14 && gs1Checksum(digits.slice(0, 13)) === digits[13]) return { value: digits, message: "Valid ITF-14 generated." };
      return { error: "ITF-14 must be 13 digits plus a calculated check digit, or 14 valid digits." };
    }

    if (type === "interleaved2of5") {
      if (digits.length >= 2 && digits.length % 2 === 0) return { value: digits, message: "Interleaved 2 of 5 generated." };
      return { error: "Interleaved 2 of 5 requires numeric input with an even number of digits." };
    }

    if (["code128", "datamatrix", "azteccode", "pdf417", "qrcode"].includes(type)) {
      if (text) return { value: text, message: `${type === "qrcode" ? "QR Code" : "Barcode"} generated for the supplied value.` };
      return { error: "Enter a value before generating this format." };
    }

    return { value: text };
  }

  function drawCode39(canvas, value) {
    const patterns = {
      "0": "101001101101",
      "1": "110100101011",
      "2": "101100101011",
      "3": "110110010101",
      "4": "101001101011",
      "5": "110100110101",
      "6": "101100110101",
      "7": "101001011011",
      "8": "110100101101",
      "9": "101100101101",
      A: "110101001011",
      B: "101101001011",
      C: "110110100101",
      D: "101011001011",
      E: "110101100101",
      F: "101101100101",
      G: "101010011011",
      H: "110101001101",
      I: "101101001101",
      J: "101011001101",
      K: "110101010011",
      L: "101101010011",
      M: "110110101001",
      N: "101011010011",
      O: "110101101001",
      P: "101101101001",
      Q: "101010110011",
      R: "110101011001",
      S: "101101011001",
      T: "101011011001",
      U: "110010101011",
      V: "100110101011",
      W: "110011010101",
      X: "100101101011",
      Y: "110010110101",
      Z: "100110110101",
      "-": "100101011011",
      ".": "110010101101",
      " ": "100110101101",
      "$": "100100100101",
      "/": "100100101001",
      "+": "100101001001",
      "%": "101001001001",
      "*": "100101101101"
    };
    const safe = `*${value.toUpperCase().replace(/[^0-9A-Z .\-$\/+%]/g, "") || "HP"}*`;
    const pattern = safe.split("").map((char) => patterns[char]).join("0");
    drawBinaryBarcode(canvas, pattern, safe);
  }

  function drawBinaryBarcode(canvas, pattern, label) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fffdf7";
    ctx.fillRect(0, 0, width, height);
    const padding = 28;
    const barWidth = (width - padding * 2) / pattern.length;
    ctx.fillStyle = "#141414";
    pattern.split("").forEach((isBar, index) => {
      if (isBar === "1") ctx.fillRect(padding + index * barWidth, 24, Math.max(1, barWidth * 0.92), height - 72);
    });
    ctx.font = "18px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(label, width / 2, height - 24);
  }

  function drawBarcode(canvas, value) {
    const leftOdd = {
      0: "0001101",
      1: "0011001",
      2: "0010011",
      3: "0111101",
      4: "0100011",
      5: "0110001",
      6: "0101111",
      7: "0111011",
      8: "0110111",
      9: "0001011"
    };
    const leftEven = {
      0: "0100111",
      1: "0110011",
      2: "0011011",
      3: "0100001",
      4: "0011101",
      5: "0111001",
      6: "0000101",
      7: "0010001",
      8: "0001001",
      9: "0010111"
    };
    const right = {
      0: "1110010",
      1: "1100110",
      2: "1101100",
      3: "1000010",
      4: "1011100",
      5: "1001110",
      6: "1010000",
      7: "1000100",
      8: "1001000",
      9: "1110100"
    };
    const parity = {
      0: "OOOOOO",
      1: "OOEOEE",
      2: "OOEEOE",
      3: "OOEEEO",
      4: "OEOOEE",
      5: "OEEOOE",
      6: "OEEEOO",
      7: "OEOEOE",
      8: "OEOEEO",
      9: "OEEOEO"
    };

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fffdf7";
    ctx.fillRect(0, 0, width, height);

    const digits = value.split("").map(Number);
    let pattern = "101";
    const sidePattern = parity[digits[0]];
    for (let index = 1; index <= 6; index += 1) {
      pattern += sidePattern[index - 1] === "O" ? leftOdd[digits[index]] : leftEven[digits[index]];
    }
    pattern += "01010";
    for (let index = 7; index <= 12; index += 1) {
      pattern += right[digits[index]];
    }
    pattern += "101";

    const padding = 28;
    const barWidth = (width - padding * 2) / pattern.length;
    ctx.fillStyle = "#15202b";
    pattern.split("").forEach((isBar, index) => {
      if (isBar === "1") ctx.fillRect(padding + index * barWidth, 24, Math.max(1, barWidth * 0.92), height - 72);
    });
    ctx.font = "18px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(value, width / 2, height - 24);
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
              <option value="isbn13">ISBN-13 / Bookland EAN</option>
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
              <dt>Code 39</dt><dd>Uppercase letters, numbers, spaces, and these symbols: - . $ / + %</dd>
              <dt>ITF-14 carton code</dt><dd>Enter 13 digits to add the check digit, or a valid 14-digit GTIN/carton code.</dd>
              <dt>Interleaved 2 of 5</dt><dd>Numbers only, with an even number of digits.</dd>
              <dt>Data Matrix, Aztec Code, PDF417, QR Code</dt><dd>Any useful text such as a URL, ISBN, contact detail, product note, or inventory reference.</dd>
            </dl>
          </details>
        </form>
        <div class="barcode-preview">
          <canvas id="barcode-canvas" width="720" height="320" aria-label="Barcode preview"></canvas>
          <div class="qr-preview" id="barcode-image-preview" hidden>
            <img alt="Barcode or QR preview">
            <p class="quiet">Specialist formats are rendered through a public barcode image service. ISBN/EAN checksum validation happens locally before rendering.</p>
          </div>
        </div>
      </section>
    `;
    const form = document.querySelector("#barcode-form");
    const type = document.querySelector("#barcode-type");
    const input = document.querySelector("#barcode-input");
    const message = document.querySelector("#barcode-message");
    const canvas = document.querySelector("#barcode-canvas");
    const imageBox = document.querySelector("#barcode-image-preview");
    const image = imageBox.querySelector("img");
    let currentDownloadUrl = "";
    let autoGenerateTimer = 0;

    function barcodeServiceUrl(format, value) {
      const params = new URLSearchParams({
        bcid: format,
        text: value,
        scale: "3",
        includetext: "true",
        textxalign: "center"
      });
      return `https://bwipjs-api.metafloor.com/?${params.toString()}`;
    }

    function clearPreview() {
      image.removeAttribute("src");
      imageBox.hidden = true;
      imageBox.style.display = "none";
      canvas.hidden = false;
      canvas.style.display = "block";
      currentDownloadUrl = "";
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fffdf7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function generate(event) {
      if (event) event.preventDefault();
      const selectedType = type.value;
      const rawValue = input.value.trim();
      clearPreview();

      if (selectedType === "isbn13" || selectedType === "issn" || selectedType === "ismn") {
        const converted = normalizeBookBarcode(selectedType, rawValue);
        if (!converted) {
          message.textContent = "That value does not match the selected publishing format or has an invalid checksum.";
          return;
        }
        input.value = converted;
        drawBarcode(canvas, converted);
        const isbn10 = isbn13To10(converted);
        message.textContent = isbn10
          ? `ISBN prefix and checksum are valid. ISBN-10 equivalent: ${isbn10}. Official ISBN assignment cannot be confirmed without an ISBN registry lookup.`
          : `Valid publishing EAN-13 generated: ${converted}. Official ISBN/ISSN/ISMN assignment cannot be confirmed without the relevant registry.`;
        return;
      }

      if (selectedType === "ean13") {
        const raw = cleanCode(rawValue).replace(/X/g, "");
        const value = raw.length === 12 ? raw + ean13Checksum(raw) : raw;
        if (value.length !== 13 || ean13Checksum(value.slice(0, 12)) !== value[12]) {
          message.textContent = "Enter 12 digits to add a check digit, or a valid 13-digit EAN.";
          return;
        }
        input.value = value;
        drawBarcode(canvas, value);
        message.textContent = `Valid EAN-13 generated: ${value}.`;
        return;
      }

      if (selectedType === "code39") {
        drawCode39(canvas, rawValue);
        message.textContent = "Code 39 generated locally for inventory, shelf, and workflow labels.";
        return;
      }

      const validation = validateServiceBarcode(selectedType, rawValue);
      if (validation.error) {
        message.textContent = validation.error;
        return;
      }

      canvas.hidden = true;
      canvas.style.display = "none";
      imageBox.hidden = false;
      imageBox.style.display = "grid";
      const serviceType = selectedType === "qrcode" ? "qrcode" : selectedType;
      const value = validation.value || data.company.name;
      currentDownloadUrl = barcodeServiceUrl(serviceType, value);
      image.src = currentDownloadUrl;
      message.textContent = validation.message || `${type.options[type.selectedIndex].text} generated for the supplied value.`;
    }

    form.addEventListener("submit", generate);
    image.addEventListener("error", () => {
      image.removeAttribute("src");
      imageBox.hidden = true;
      imageBox.style.display = "none";
      currentDownloadUrl = "";
      message.textContent = "This value is outside the range or rules for the selected barcode format. Check the required length, digits, and check digit.";
    });
    function queueGenerate() {
      window.clearTimeout(autoGenerateTimer);
      autoGenerateTimer = window.setTimeout(() => generate(), 250);
    }

    type.addEventListener("change", generate);
    input.addEventListener("input", queueGenerate);
    document.querySelector("#download-barcode").addEventListener("click", () => {
      if (currentDownloadUrl) {
        window.open(currentDownloadUrl, "_blank", "noopener");
        return;
      }
      const link = document.createElement("a");
      link.download = `barcode-${input.value.replace(/\D/g, "") || "draft"}.png`;
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
