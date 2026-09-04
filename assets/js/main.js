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

  // Formspree-backed forms (email capture, coaching inquiry, etc.) — any form with
  // [data-capture-form] posts its fields as-is to the same endpoint. Customize the
  // success text per-form via data-success-message; falls back to the join-list default.
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/mnpqvkwv";
  const DEFAULT_SUCCESS_MESSAGE = "You're on the list — check your inbox to confirm.";

  document.querySelectorAll("[data-capture-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const success = form.parentElement.querySelector(".form-success");
      if (!input || !input.value) return;

      const successMessage = form.dataset.successMessage || DEFAULT_SUCCESS_MESSAGE;

      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then((res) => {
          if (!success) return;
          if (res.ok) {
            success.textContent = successMessage;
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
