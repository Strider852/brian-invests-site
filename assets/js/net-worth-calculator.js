// Net worth calculator — all client-side, nothing leaves the browser.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("nw-form");
  if (!form) return; // this script only runs on the calculator page

  const assetIds = ["cash", "investments", "property", "other-assets"];
  const liabilityIds = ["mortgage", "loans", "credit-card", "other-debt"];

  const resultEl = document.getElementById("nw-result");
  const assetsEl = document.getElementById("nw-assets");
  const liabilitiesEl = document.getElementById("nw-liabilities");
  const noteEl = document.getElementById("nw-note");

  const money = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const sum = (ids) =>
    ids.reduce((total, id) => {
      const val = parseFloat(document.getElementById(id).value);
      return total + (Number.isFinite(val) ? val : 0);
    }, 0);

  function recalculate() {
    const totalAssets = sum(assetIds);
    const totalLiabilities = sum(liabilityIds);
    const netWorth = totalAssets - totalLiabilities;

    resultEl.textContent = money(netWorth);
    assetsEl.textContent = money(totalAssets);
    liabilitiesEl.textContent = money(totalLiabilities);

    if (totalAssets === 0 && totalLiabilities === 0) {
      noteEl.textContent = "Fill in a few numbers to see where you stand.";
    } else if (netWorth < 0) {
      noteEl.textContent =
        "A negative number here is normal early on (student loans, a new mortgage). What matters is the trend over time, not this one snapshot.";
    } else {
      noteEl.textContent =
        "Track this number every few months, not every day — net worth moves slowly and that's fine.";
    }
  }

  form.addEventListener("input", recalculate);
  recalculate();
});
