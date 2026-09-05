// Resiliency score calculator — a multiple-choice profile survey, all client-side,
// nothing leaves the browser.
//
// Educational framework only, not personalized financial advice. Scores four
// categories out of 100 total: liquidity & cost of living (30), job & income
// security (25), future-proofing (25), and investing habits (20). Weights and
// thresholds are a simple, transparent heuristic — not a regulated or scientific
// formula. Ranges are used instead of exact dollar entry so nothing precise has
// to be typed in or shared.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("rs-form");
  if (!form) return; // this script only runs on the resiliency score page

  const resultEl = document.getElementById("rs-result");
  const badgeEl = document.getElementById("rs-badge");
  const noteEl = document.getElementById("rs-note");
  const liquidityEl = document.getElementById("rs-liquidity");
  const jobSecurityEl = document.getElementById("rs-jobsecurity");
  const futureEl = document.getElementById("rs-future");
  const investingEl = document.getElementById("rs-investing");
  const recommendTextEl = document.getElementById("rs-recommend-text");
  const recommendCtaEl = document.getElementById("rs-recommend-cta");
  const recommendAltEl = document.getElementById("rs-recommend-alt");

  const GUMROAD_URL = "https://brianinvests.gumroad.com/l/qqescp";

  // Whichever of the 4 categories is weakest (as a % of its own max, so a 25-pt
  // category can be compared fairly against a 30-pt one) drives which product/
  // service gets recommended. Ties are broken by this fixed priority order.
  const RECOMMENDATIONS = {
    liquidity: {
      text: "Your biggest gap is liquidity — the buffer that keeps a bad month from becoming a crisis. Wealth OS gives you a simple system to build and track it.",
      cta: { label: "Get Wealth OS on Gumroad →", href: GUMROAD_URL, external: true },
      alt: { label: "Or book 1:1 coaching for a hands-on plan", href: "../index.html#coaching" },
    },
    jobsecurity: {
      text: "Your biggest gap is job & income security — relying on one income source is the highest-leverage risk to fix. This is exactly what 1:1 coaching is for.",
      cta: { label: "Book 1:1 coaching →", href: "../index.html#coaching", external: false },
      alt: { label: "Or get Wealth OS to track your numbers", href: GUMROAD_URL },
    },
    future: {
      text: "Your biggest gap is future-proofing — how ready you are for AI reshaping your industry. 1:1 coaching can help you build a concrete plan here.",
      cta: { label: "Book 1:1 coaching →", href: "../index.html#coaching", external: false },
      alt: { label: "Or join the list for AI & future-of-work content", href: "../index.html#join" },
    },
    investing: {
      text: "Your biggest gap is investing habits — consistency matters more than picking the perfect fund. Wealth OS's tracker can help you build the habit.",
      cta: { label: "Get Wealth OS on Gumroad →", href: GUMROAD_URL, external: true },
      alt: { label: "Or book 1:1 coaching for a hands-on plan", href: "../index.html#coaching" },
    },
  };

  const val = (id) => document.getElementById(id).value;

  // Representative midpoints for each range, used only to size one bucket against
  // another (e.g. expenses vs. income) — never shown back to the user as a number.
  const INCOME_MIDPOINT = { "u30": 20000, "30-60": 45000, "60-100": 80000, "100-150": 125000, "150p": 175000 };
  const EXPENSES_MIDPOINT = { "u1k": 750, "1-2k": 1500, "2-4k": 3000, "4-6k": 5000, "6kp": 7000 };
  const BALANCE_MIDPOINT = { "0": 0, "u10k": 5000, "10-50k": 30000, "50-150k": 100000, "150kp": 200000 };

  const EMERGENCY_FUND_POINTS = { "0": 0, "lt1": 5, "1-3": 12, "3-6": 17, "6p": 20 };
  const JOB_SECURITY_POINTS = { "high-risk": 0, "somewhat-risk": 5, "somewhat-secure": 10, "very-secure": 15 };
  const OTHER_INCOME_POINTS = { "none": 0, "some": 6, "diversified": 10 };
  const AI_FAMILIARITY_POINTS = { "none": 0, "tried": 5, "regular": 10, "leverage": 15 };
  const OTHER_SKILLSET_POINTS = { "none": 0, "untapped": 5, "monetized": 10 };
  const RETIREMENT_POINTS = { "no": 0, "occasionally": 4, "regularly": 8 };
  const INVESTMENT_STYLE_POINTS = { "none": 0, "cash": 3, "index": 7, "active": 5, "speculative": 2 };

  function scoreExpenseRatio(incomeKey, expensesKey) {
    const annualIncome = INCOME_MIDPOINT[incomeKey];
    const annualExpenses = EXPENSES_MIDPOINT[expensesKey] * 12;
    const ratio = annualExpenses / annualIncome;
    if (ratio < 0.3) return 10;
    if (ratio < 0.5) return 7;
    if (ratio < 0.7) return 4;
    return 0;
  }

  function scoreInvestmentBalance(incomeKey, balanceKey) {
    const annualIncome = INCOME_MIDPOINT[incomeKey];
    const balance = BALANCE_MIDPOINT[balanceKey];
    if (balance <= 0) return 0;
    const ratio = balance / annualIncome;
    if (ratio >= 1) return 5;
    if (ratio >= 0.5) return 4;
    if (ratio >= 0.25) return 3;
    return 1;
  }

  function categoryFor(score) {
    if (score >= 70) return { label: "Resilient", note: "Solid footing across income, safety net, and future-proofing. Keep the habits that got you here — reassess yearly as your job, industry, or AI's impact on it changes." };
    if (score >= 40) return { label: "Stable", note: "You're not fragile, but there are clear gaps — often the emergency fund, job security, or lack of a second income stream. Closing the lowest-scoring category below moves you to \"resilient\" fastest." };
    return { label: "Fragile", note: "A single shock (job loss, medical bill, market drop, or your role being automated) could hit hard right now. Start with whichever category below scored lowest." };
  }

  function recalculate() {
    const incomeKey = val("rs-income");
    const expensesKey = val("rs-expenses");
    const emergencyKey = val("rs-emergency");
    const jobSecurityKey = val("rs-job-security");
    const otherIncomeKey = val("rs-other-income");
    const aiKey = val("rs-ai-familiarity");
    const skillsetKey = val("rs-other-skillset");
    const retirementKey = val("rs-retirement");
    const styleKey = val("rs-investment-style");
    const balanceKey = val("rs-investment-balance");

    const liquidityScore = EMERGENCY_FUND_POINTS[emergencyKey] + scoreExpenseRatio(incomeKey, expensesKey);
    const jobSecurityScore = JOB_SECURITY_POINTS[jobSecurityKey] + OTHER_INCOME_POINTS[otherIncomeKey];
    const futureScore = AI_FAMILIARITY_POINTS[aiKey] + OTHER_SKILLSET_POINTS[skillsetKey];
    const investingScore = RETIREMENT_POINTS[retirementKey] + INVESTMENT_STYLE_POINTS[styleKey] + scoreInvestmentBalance(incomeKey, balanceKey);

    const total = liquidityScore + jobSecurityScore + futureScore + investingScore;

    resultEl.innerHTML = total + '<span style="font-size:1.4rem;">/100</span>';
    liquidityEl.textContent = liquidityScore + " / 30";
    jobSecurityEl.textContent = jobSecurityScore + " / 25";
    futureEl.textContent = futureScore + " / 25";
    investingEl.textContent = investingScore + " / 20";

    const { label, note } = categoryFor(total);
    badgeEl.textContent = label;
    noteEl.textContent = note;

    const categoryPct = {
      liquidity: liquidityScore / 30,
      jobsecurity: jobSecurityScore / 25,
      future: futureScore / 25,
      investing: investingScore / 20,
    };
    const weakestKey = Object.keys(categoryPct).reduce((a, b) => (categoryPct[b] < categoryPct[a] ? b : a));
    const recommendation = RECOMMENDATIONS[weakestKey];

    recommendTextEl.textContent = recommendation.text;
    recommendCtaEl.textContent = recommendation.cta.label;
    recommendCtaEl.href = recommendation.cta.href;
    if (recommendation.cta.external) {
      recommendCtaEl.setAttribute("target", "_blank");
      recommendCtaEl.setAttribute("rel", "noopener");
    } else {
      recommendCtaEl.removeAttribute("target");
      recommendCtaEl.removeAttribute("rel");
    }
    recommendAltEl.textContent = recommendation.alt.label;
    recommendAltEl.href = recommendation.alt.href;
  }

  form.addEventListener("input", recalculate);
  recalculate();
});
