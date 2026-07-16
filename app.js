function renderContact() {
    main.innerHTML = `
      <section class="page-hero">
        <p class="eyebrow">Mailing List</p>
        <h1>Join our list.</h1>
        <p>Sign up to stay updated with everything happening at Bound Text Publishing.</p>
      </section>
      <section class="section">
        <div class="tool-panel" style="max-width: 600px; margin: 0 auto; text-align: center;">
          <h2>Subscribe</h2>
          <p>Get direct launch updates and private announcements.</p>
          <br>
          <form id="signup-form" style="display: flex; flex-direction: column; gap: 12px; max-width: 400px; margin: 0 auto;">
            <input type="email" id="signup-email" placeholder="Enter your email address" required style="padding: 12px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 16px; width: 100%; box-sizing: border-box;">
            <button type="submit" class="button primary" style="width: 100%; padding: 12px; cursor: pointer; border: none; font-size: 16px; font-weight: bold;">Join List</button>
          </form>
          <p id="signup-status" style="margin-top: 20px; font-weight: bold; font-size: 16px; min-height: 24px;"></p>
        </div>
      </section>
    `;

    const form = document.querySelector("#signup-form");
    const statusText = document.querySelector("#signup-status");

    form.addEventListener("submit", async (event) => {
      event.preventDefault(); // Stop the page from reloading
      
      const emailInput = document.querySelector("#signup-email");
      const email = emailInput.value.trim();

      statusText.style.color = "#1a202c";
      statusText.textContent = "Submitting your email...";

      try {
        // Try sending as clean JSON data (Standard for Cloudflare Workers)
        const response = await fetch("https://boundtext-signup-engine.colin-533.workers.dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email })
        });

        if (response.ok) {
          statusText.style.color = "green";
          statusText.textContent = "Success! You have been added to the list.";
          emailInput.value = ""; // Clear out the text box
        } else {
          throw new Error("JSON failed");
        }
      } catch (error) {
        // Fallback: Try sending as standard Form Data if your worker expects that instead
        try {
          const formData = new URLSearchParams();
          formData.append("email", email);

          const backupResponse = await fetch("https://boundtext-signup-engine.colin-533.workers.dev", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
          });

          if (backupResponse.ok) {
            statusText.style.color = "green";
            statusText.textContent = "Success! You have been added to the list.";
            emailInput.value = "";
          } else {
            statusText.style.color = "red";
            statusText.textContent = "The subscription server returned an error. Please try again.";
          }
        } catch (backupError) {
          statusText.style.color = "red";
          statusText.textContent = "Connection blocked. Please check your network or CORS setup.";
        }
      }
    });
  }
