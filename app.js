(function () {
  const data = window.HP_CONTENT;
  const main = document.querySelector("#main");
  const menuButton = document.querySelector(".menu-button");
  const menu = document.querySelector("#site-menu");

  function iconArrow() {
    return document.querySelector("#icon-arrow") ? document.querySelector("#icon-arrow").innerHTML : "→";
  }

  function renderAuthors() {
    main.innerHTML = `
      <section class="page-hero">
        <p class="eyebrow">Authors</p>
        <h1>Three voices, one compact publishing house.</h1>
      </section>
      <section class="authors-list">
        ${data.authors.map(author => `
          <article class="author-panel" id="${author.id}">
            <div class="author-portrait" style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; background: #ddd; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${author.image 
                ? `<img src="${author.image}" alt="${author.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` 
                : ""}
              <div class="initials" style="${author.image ? 'display:none;' : 'display:flex;'} width: 100%; height: 100%; align-items: center; justify-content: center; font-weight: bold;">
                ${author.initials}
              </div>
            </div>
            <div>
              <p class="eyebrow">${author.role}</p>
              <h2>${author.name}</h2>
              <p>${author.bio}</p>
            </div>
          </article>
        `).join("")}
      </section>
    `;
  }

  // Initial render trigger
  function render() {
    if (location.hash === "#authors") {
      renderAuthors();
    } else {
      main.innerHTML = "<h1>Welcome to Huffed and Puffed</h1>";
    }
  }

  window.addEventListener("hashchange", render);
  render();
})();
