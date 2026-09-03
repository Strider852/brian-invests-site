// Shared behavior across every page: mobile nav toggle + email capture form.
// No build step — plain JS, loaded with a <script defer> tag.

document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      const expanded = links.classList.contains("open");
      toggle.setAttribute("aria-expanded", String(expanded));
    });
  }

  // Email capture form(s)
  // TODO: wire this up to a real provider (ConvertKit / Beehiiv / Mailchimp / a Google Sheet via a
  // service like Formspree). Right now it just confirms locally so the page is fully functional
  // before you've picked a provider. Search "TODO: EMAIL PROVIDER" to find where to swap this in.
  document.querySelectorAll("[data-capture-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const success = form.parentElement.querySelector(".form-success");
      if (!input || !input.value) return;

      // TODO: EMAIL PROVIDER — replace this block with a real fetch() to your
      // list provider's API or form endpoint, e.g.:
      // fetch("https://api.convertkit.com/v3/forms/FORM_ID/subscribe", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ api_key: "YOUR_KEY", email: input.value }),
      // });

      if (success) {
        success.textContent = "You're on the list — check your inbox to confirm.";
        success.classList.add("show");
      }
      form.reset();
    });
  });
});
