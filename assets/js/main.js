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

  // Email capture form(s) — submissions go to Formspree.
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/mnpqvkwv";

  document.querySelectorAll("[data-capture-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const success = form.parentElement.querySelector(".form-success");
      if (!input || !input.value) return;

      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then((res) => {
          if (!success) return;
          if (res.ok) {
            success.textContent = "You're on the list — check your inbox to confirm.";
            form.reset();
          } else {
            success.textContent = "Something went wrong — please try again.";
          }
          success.classList.add("show");
        })
        .catch(() => {
          if (success) {
            success.textContent = "Something went wrong — please try again.";
            success.classList.add("show");
          }
        });
    });
  });
});
