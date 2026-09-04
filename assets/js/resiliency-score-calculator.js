// Resiliency score calculator — all client-side, nothing leaves the browser.
//
// Educational framework only, not personalized financial advice. Scores four factors
// out of 100 total: emergency fund (35), net worth vs. income (30), debt vs. income (20),
// and income mix (15). Weights and thresholds are a simple, transparent heuristic —
// not a regulated or scientific formula.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("rs-form");
  if (!form) return; // this script only runs on the resiliency score page

  const assetIds = ["rs-cash", "rs-investments", "rs-property", "rs-other-assets"];
  const liabilityIds = ["rs-mortgage", "rs-loans", "rs-credit-card", "rs-other-debt"];

  const resultEl = document.getElementById("rs-result");
  const badgeEl = document.getElementById("rs-badge");
  const noteEl = document.getElementById("rs-note");
  const emergencyEl = document.getElementById("rs-emergency");
  const networthEl = document.getElementById("rs-networth");
  const dtiEl = document.getElementById("rs-dti");
  const incomeEl = document.getElementById("rs-income");

  const num = (id) => {
    const val = parseFloat(document.getElementById(id).value);
    return Number.isFinite(val) ? val : 0;
  };
  const sum = (ids) => ids.reduce((total, id) => total + num(id), 0);

  // Emergency fund: months of essential expenses covered by cash on hand.
  function scoreEmergencyFund(cash, monthlyExpenses) {
    if (monthlyExpenses <= 0) return 0;
    const months = cash / monthlyExpenses;
    if (months >= 6) return 35;
    if (months >= 3) return 25;
    if (months >= 1) return 15;
    if (months > 0) return 5;
    return 0;
  }

  // Net worth sized against annual income — a common, simple resilience proxy.
  function scoreNetWorth(netWorth, annualIncome) {
    if (netWorth <= 0) return netWorth === 0 ? 5 : 0;
    if (annualIncome <= 0) return 15; // positive net worth, no income given to compare against
    const multiple = netWorth / annualIncome;
    if (multiple >= 3) return 30;
    if (multiple >= 1) return 25;
    if (multiple >= 0.5) return 20;
    return 10;
  }

  // Total debt sized against annual income — lower is more resilient.
  function scoreDebtToIncome(totalDebt, annualIncome) {
    if (totalDebt <= 0) return 20;
    if (annualIncome <= 0) return 0; // debt with no income to service it is the worst case
    const multiple = totalDebt / annualIncome;
    if (multiple < 0.5) return 20;
    if (multiple < 1) return 15;
    if (multiple < 2) return 10;
    if (multiple < 4) return 5;
    return 0;
  }

  function scoreIncomeMix(mix) {
    if (mix === "diversified") return 15;
    if (mix === "side") return 10;
    return 5; // single job, one employer
  }

  function categoryFor(score) {
    if (score >= 70) return { label: "Resilient", note: "Solid footing — you could absorb a job loss or a market drop without major disruption. Keep the habits that got you here." };
    if (score >= 40) return { label: "Stable", note: "You're not fragile, but there are clear gaps — usually the emergency fund or debt load. Closing those moves you into \"resilient\" fastest." };
    return { label: "Fragile", note: "A single shock (job loss, medical bill, market drop) could hit hard right now. Start with the emergency fund — it's the highest-leverage fix." };
  }

  function recalculate() {
    const totalAssets = sum(assetIds);
    const totalLiabilities = sum(liabilityIds);
    const annualIncome = num("rs-annual-income");
    const monthlyExpenses = num("rs-monthly-expenses");

    const hasAnyInput = totalAssets || totalLiabilities || annualIncome || monthlyExpenses;
    if (!hasAnyInput) {
      resultEl.innerHTML = '0<span style="font-size:1.4rem;">/100</span>';
      emergencyEl.textContent = "0 / 35";
      networthEl.textContent = "0 / 30";
      dtiEl.textContent = "0 / 20";
      incomeEl.textContent = "0 / 15";
      badgeEl.textContent = "—";
      noteEl.textContent = "Fill in a few numbers to see your score.";
      return;
    }

    const netWorth = totalAssets - totalLiabilities;
    const cash = num("rs-cash");
    const incomeMix = document.getElementById("rs-income-stability").value;

    const emergencyScore = scoreEmergencyFund(cash, monthlyExpenses);
    const netWorthScore = scoreNetWorth(netWorth, annualIncome);
    const dtiScore = scoreDebtToIncome(totalLiabilities, annualIncome);
    const incomeScore = scoreIncomeMix(incomeMix);
    const total = emergencyScore + netWorthScore + dtiScore + incomeScore;

    resultEl.innerHTML = total + '<span style="font-size:1.4rem;">/100</span>';
    emergencyEl.textContent = emergencyScore + " / 35";
    networthEl.textContent = netWorthScore + " / 30";
    dtiEl.textContent = dtiScore + " / 20";
    incomeEl.textContent = incomeScore + " / 15";

    const { label, note } = categoryFor(total);
    badgeEl.textContent = label;
    noteEl.textContent = note;
  }

  form.addEventListener("input", recalculate);
  recalculate();
});
