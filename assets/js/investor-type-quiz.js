// Investor type quiz — all client-side, nothing leaves the browser.
//
// Educational framework only, not personalized financial advice. Each answer awards
// weighted points toward one or more of 5 archetypes (long-term, passive/index, swing,
// day trader, options trader); the highest-scoring archetype wins. This is a "which type
// fits you" classification, not a 0-100 score like the resiliency calculator.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("it-form");
  if (!form) return; // this script only runs on the investor type quiz page

  const resultEl = document.getElementById("it-result");
  const runnerUpEl = document.getElementById("it-runnerup");
  const descriptionEl = document.getElementById("it-description");
  const breakdownEl = document.getElementById("it-breakdown");
  const recommendTextEl = document.getElementById("it-recommend-text");
  const recommendCtaEl = document.getElementById("it-recommend-cta");
  const recommendAltEl = document.getElementById("it-recommend-alt");

  const GUMROAD_URL = "https://brianinvests.gumroad.com/l/qqescp";

  const val = (id) => document.getElementById(id).value;

  const TYPES = {
    "long-term": "Long-Term Investor",
    "passive": "Passive / Index Investor",
    "swing": "Swing Trader",
    "day": "Day Trader",
    "options": "Options Trader",
  };

  // Each question maps an answer value to points awarded per archetype.
  const DRAWDOWN_POINTS = {
    panic: { passive: 3, "long-term": 1 },
    hold: { "long-term": 3, passive: 1 },
    calm: { swing: 2, "long-term": 2 },
    opportunity: { day: 2, options: 3 },
  };
  const KNOWLEDGE_POINTS = {
    beginner: { passive: 3 },
    intermediate: { "long-term": 3 },
    advanced: { swing: 3, day: 2 },
    expert: { options: 3, day: 1 },
  };
  const TIME_POINTS = {
    none: { passive: 3 },
    few: { "long-term": 2, swing: 1 },
    daily: { swing: 3 },
    intraday: { day: 3, options: 1 },
  };
  const HORIZON_POINTS = {
    decades: { "long-term": 3, passive: 2 },
    years: { "long-term": 1, swing: 2 },
    weeks: { swing: 3 },
    days: { day: 2, swing: 1 },
    intraday: { day: 3 },
  };
  const GOAL_POINTS = {
    steady: { "long-term": 3 },
    passive: { passive: 3 },
    active: { swing: 2, day: 2 },
    "income-options": { options: 3 },
    speculative: { day: 2, options: 2 },
  };
  const LEVERAGE_POINTS = {
    none: { "long-term": 2, passive: 2 },
    curious: { swing: 1 },
    comfortable: { options: 2, day: 1 },
    core: { options: 3, day: 2 },
  };

  function addPoints(totals, pointsMap) {
    Object.entries(pointsMap).forEach(([type, pts]) => {
      totals[type] = (totals[type] || 0) + pts;
    });
  }

  function categoryFor(type, optionsFlavor) {
    const base = {
      "long-term": {
        title: "Long-Term Investor",
        description: "You're playing the long game — steady, diversified, and patient. Buy-and-hold with a multi-year (or multi-decade) horizon is one of the most historically reliable ways to build wealth, and it doesn't require watching a screen all day.",
      },
      passive: {
        title: "Passive / Index Investor",
        description: "You want your money working for you with the least possible hands-on effort. Low-cost index funds and a \"set it and forget it\" approach fit your risk tolerance and time availability well — consistency matters more than picking winners.",
      },
      swing: {
        title: "Swing Trader",
        description: "You're comfortable holding positions for days to weeks, blending technical signals with an eye on the fundamentals. This demands more active attention than long-term investing, but not the constant monitoring day trading requires.",
      },
      day: {
        title: "Day Trader",
        description: "You're wired for speed — in and out within a single session, chasing intraday moves. This is the most time-intensive and highest-risk style here; it demands real skill, strict risk management, and the temperament to handle rapid losses without flinching.",
      },
      options: {
        title: "Options Trader",
        description: "You're drawn to derivatives — options give you tools beyond plain stock ownership, whether that's leverage, income generation, or hedging. This requires real options mechanics knowledge (assignment risk, strike selection, time decay) to do well.",
      },
    };

    if (type === "options") {
      if (optionsFlavor === "income") {
        return {
          title: "Options Trader — Income-Focused",
          description: "You lean toward income-generating options strategies like covered calls or cash-secured puts, rather than speculative directional bets. That's a meaningfully different — and generally lower-risk — approach than buying calls/puts for leveraged upside, but it still requires real options mechanics knowledge (assignment risk, strike selection, time decay).",
        };
      }
      if (optionsFlavor === "speculative") {
        return {
          title: "Options Trader — Speculative / Directional",
          description: "You're drawn to options for leveraged, directional bets — bigger potential gains, but faster and steeper potential losses than most other styles here. This requires real technical skill and strict risk management to do well.",
        };
      }
    }

    return base[type];
  }

  function recalculate() {
    const totals = {};
    addPoints(totals, DRAWDOWN_POINTS[val("it-drawdown")]);
    addPoints(totals, KNOWLEDGE_POINTS[val("it-knowledge")]);
    addPoints(totals, TIME_POINTS[val("it-time")]);
    addPoints(totals, HORIZON_POINTS[val("it-horizon")]);
    addPoints(totals, GOAL_POINTS[val("it-goal")]);
    addPoints(totals, LEVERAGE_POINTS[val("it-leverage")]);

    const ranked = Object.keys(TYPES)
      .map((type) => ({ type, points: totals[type] || 0 }))
      .sort((a, b) => b.points - a.points);

    const winner = ranked[0].type;
    const runnerUp = ranked[1];

    // Distinguish income vs. speculative options flavor from the goal answer (primary
    // signal) — falls back to undefined (generic options description) if neither fired.
    const goalKey = val("it-goal");
    let optionsFlavor;
    if (goalKey === "income-options") optionsFlavor = "income";
    else if (goalKey === "speculative") optionsFlavor = "speculative";

    const { title, description } = categoryFor(winner, optionsFlavor);

    resultEl.textContent = title;
    runnerUpEl.textContent = "Runner-up: " + TYPES[runnerUp.type];
    descriptionEl.textContent = description;

    breakdownEl.innerHTML = ranked
      .map((r) => `<div class="breakdown-row"><span>${TYPES[r.type]}</span><strong>${r.points} pts</strong></div>`)
      .join("");

    const NOT_COACHING_SCOPE = winner === "day" || winner === "options";

    if (NOT_COACHING_SCOPE) {
      recommendTextEl.textContent = "Day trading and options strategies are specialized territory — deeper than what I personally coach on (I focus on budgeting, net worth, and long-term investing fundamentals, not live trade signals or technical systems). But those fundamentals still matter no matter how you trade. Wealth OS can help you track them.";
      recommendCtaEl.textContent = "Get Wealth OS on Gumroad →";
      recommendCtaEl.href = GUMROAD_URL;
      recommendCtaEl.setAttribute("target", "_blank");
      recommendCtaEl.setAttribute("rel", "noopener");
      recommendAltEl.textContent = "Or join the community waitlist to connect with others";
      recommendAltEl.href = "../index.html#community";
    } else {
      recommendTextEl.textContent = "Wealth OS gives you a simple system to track your budgeting, net worth, and investing progress. Want a plan built around your actual numbers? I offer 1:1 coaching on budgeting, net worth, and general investing approach.";
      recommendCtaEl.textContent = "Get Wealth OS on Gumroad →";
      recommendCtaEl.href = GUMROAD_URL;
      recommendCtaEl.setAttribute("target", "_blank");
      recommendCtaEl.setAttribute("rel", "noopener");
      recommendAltEl.textContent = "Or book 1:1 coaching for a hands-on plan";
      recommendAltEl.href = "../index.html#coaching";
    }
  }

  form.addEventListener("input", recalculate);
  recalculate();
});
