import { TOOL_SLUGS, TOOL_CATEGORIES, TOOL_CURRENCIES, isToolCurrency, toolCategoryOf, tieredPricing, subscriptionCosts } from "./calculations.js?v=202610241";
import { toolsCopyZh as baseText } from "./calculator-copy.js?v=202610241";
import { escapeHtml, field, resultRow } from "./calculator-ui.js?v=202610241";
import * as views from "./calculator-views.js?v=202610241";

const calculators = {
  "pricing-profit-calculator": views.ProfitCalculator,
  "mrr-calculator": views.MrrCalculator,
  "ltv-cac-calculator": views.LtvCacCalculator,
  "churn-rate-calculator": views.ChurnCalculator,
  "runway-calculator": views.RunwayCalculator,
  "tax-reserve-calculator": views.TaxReserveCalculator,
  "referral-loop-calculator": views.ReferralLoopCalculator,
  "conversion-rate-calculator": views.ConversionRateCalculator,
  "nrr-calculator": views.NrrCalculator,
  "ai-api-cost-calculator": views.AiApiCostCalculator,
  "revenue-goal-calculator": views.RevenueGoalCalculator,
  "ad-roas-calculator": views.AdRoasCalculator,
  "refund-chargeback-calculator": views.RefundChargebackCalculator,
  "sponsorship-cpm-calculator": views.SponsorshipCpmCalculator,
  "email-list-growth-calculator": views.EmailListGrowthCalculator,
  "outsource-vs-diy-calculator": views.OutsourceCalculator,
  "lifetime-vs-subscription-calculator": views.LifetimeDealCalculator,
  "affiliate-commission-calculator": views.AffiliateCommissionCalculator,
  "mrr-goal-calculator": views.MrrGoalCalculator,
  "tiered-pricing-calculator": renderTiers,
  "subscription-cost-calculator": renderSubscriptions,
};
const CATEGORY_TAGS = {
  revenue: "定价",
  growth: "增长",
  planning: "规划",
};
const scenarios = {
  "pricing-adjustment-calculator": [
    { id: "annual", render: views.AnnualPricingCalculator },
    { id: "discount", render: views.DiscountImpactCalculator },
    { id: "increase", render: views.PriceIncreaseCalculator },
  ],
  "freelance-income-calculator": [
    { id: "rate", render: views.FreelanceRateCalculator },
    { id: "salary", render: views.HourlyToSalaryCalculator },
    { id: "project", render: views.ProjectQuoteCalculator },
  ],
};
const catalog = document.querySelector("#calculator-catalog");
const detail = document.querySelector("#calculator-detail");
const sections = document.querySelector("#calculator-sections");
const directory = document.querySelector("#calculator-directory");
const search = document.querySelector("#calculator-search");
const form = document.querySelector("#calculator-form");
const output = document.querySelector("#calculator-output");
const currencySelect = document.querySelector("#tool-currency");
const scenarioButtons = document.querySelector("#calculator-scenarios");
const slug = new URLSearchParams(location.search).get("tool");
const states = new Map();
let currency = baseText.currency.defaultCurrency;
let activeScenario;
let subscriptions = [{ id: 0, name: "", amount: "0", period: "monthly" }];
let nextSubscriptionId = 1;
let scrollSpyFrame = 0;
let activeCategory;

directory.innerHTML = TOOL_CATEGORIES.map(category => `
  <a class="tools-tab" href="./tools.html#${category.id}" data-category="${category.id}">
    <span>${baseText.categories[category.id]}</span><span class="tools-tab-count">${category.slugs.length}</span>
  </a>`).join("");

function setActiveCategory(category) {
  if (activeCategory === category) return;
  activeCategory = category;
  directory.querySelectorAll("[data-category]").forEach(link => {
    const isActive = link.dataset.category === category;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function updateActiveCategoryFromScroll() {
  if (catalog.hidden || scrollSpyFrame) return;
  scrollSpyFrame = window.requestAnimationFrame(() => {
    scrollSpyFrame = 0;
    const visibleSections = [...sections.querySelectorAll(".tools-section")];
    const triggerY = window.innerHeight * 2 / 5;
    const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = visibleSections[0];
    if (reachedBottom) {
      current = visibleSections.at(-1);
    } else {
      visibleSections.forEach(section => {
        if (section.getBoundingClientRect().top <= triggerY) current = section;
      });
    }
    setActiveCategory(current?.id || null);
  });
}

function renderCatalog() {
  const query = search.value.trim().toLowerCase();
  let total = 0;
  sections.innerHTML = TOOL_CATEGORIES.map((category, index) => {
    const slugs = category.slugs.filter(key => {
      const tool = baseText.tools[key];
      return `${tool.name} ${tool.summary} ${baseText.categories[category.id]}`.toLowerCase().includes(query);
    });
    total += slugs.length;
    if (!slugs.length) return "";
    return `<section class="tools-section category-${category.id}" id="${category.id}" aria-labelledby="title-${category.id}">
      <div class="tools-section-head"><span class="tools-section-number" aria-hidden="true">0${index + 1}</span>
        <h2 class="tools-section-title" id="title-${category.id}">${baseText.categories[category.id]}</h2>
        <span class="tools-section-count">${slugs.length} 个工具</span>
      </div>
      <div class="tools-grid">${slugs.map(key => `<a class="tools-card calculator-card" href="./tools.html?tool=${key}">
        <span class="calculator-card-mark" aria-hidden="true">${CATEGORY_TAGS[category.id]}</span>
        <span class="tools-card-copy">
          <span class="tools-card-name">${escapeHtml(baseText.tools[key].name)}</span>
          <span class="tools-card-desc">${escapeHtml(baseText.tools[key].summary)}</span>
        </span></a>`).join("")}</div>
    </section>`;
  }).join("");
  document.querySelector("#calculator-count").textContent = `共 ${total} 个工具`;
  document.querySelector("#calculator-empty").hidden = total !== 0;
  updateActiveCategoryFromScroll();
}

function valuesForScenario() {
  const key = activeScenario?.id || slug;
  if (!states.has(key)) states.set(key, {});
  return states.get(key);
}

function renderCalculator(updateInputs = true) {
  const text = views.withCurrencyLabels(baseText, currency);
  const render = activeScenario?.render || calculators[slug];
  const result = render({ locale: "zh", text, currency, values: valuesForScenario() });
  if (updateInputs) form.innerHTML = result.inputs;
  output.innerHTML = result.output;
  if (slug === "subscription-cost-calculator") {
    const format = views.formatters("zh", currency);
    const costs = subscriptionCosts(subscriptions.map(item => ({ amount: views.toNumber(item.amount), period: item.period })));
    form.querySelectorAll("[data-share]").forEach((element, index) => {
      element.textContent = `${text.results.spendingShare}: ${format.percent(costs.shares[index])}`;
    });
  }
}

function selectScenario() {
  const choices = scenarios[slug];
  if (choices) {
    activeScenario = choices.find(choice => choice.id === location.hash.slice(1)) || choices[0];
    scenarioButtons.hidden = false;
    scenarioButtons.innerHTML = choices.map(choice => `<button type="button" data-scenario="${choice.id}"
      aria-controls="calculator-form calculator-output" aria-pressed="${choice === activeScenario}">${baseText.workflow[choice.id]}</button>`).join("");
  }
  renderCalculator();
}

function renderTiers({ locale, text, currency, values }) {
  const customers = values.customers ?? "300";
  const tiers = [["9", "60"], ["29", "30"], ["79", "10"]].map(([price, share], index) => ({
    price: values[`tier-price-${index}`] ?? price,
    share: values[`tier-share-${index}`] ?? share,
  }));
  const format = views.formatters(locale, currency);
  const result = tieredPricing({ customers: views.toNumber(customers), tiers: tiers.map(tier => ({
    price: views.toNumber(tier.price), sharePercent: views.toNumber(tier.share),
  })) });
  return {
    inputs: `<div class="tool-inputs">${field({ id: "customers", name: "customers", label: text.labels.customers, value: customers, step: "1" })}</div>
      ${tiers.map((tier, index) => `<fieldset class="subscription-item"><legend>${text.workflow.tier} ${index + 1}</legend><div class="tool-inputs">
        ${field({ id: `tier-price-${index}`, name: `tier-price-${index}`, label: text.labels.tierPrice, value: tier.price })}
        ${field({ id: `tier-share-${index}`, name: `tier-share-${index}`, label: text.labels.tierShare, value: tier.share, max: 100 })}
      </div></fieldset>`).join("")}`,
    output: `<dl class="tool-results">
      ${resultRow({ label: text.results.mrr, value: format.money(result.mrr), strong: true })}
      ${resultRow({ label: text.results.arr, value: format.money(result.arr) })}
      ${resultRow({ label: text.results.blendedArpu, value: format.money(result.arpu) })}</dl>
      <div class="tool-table-wrap"><table class="tool-table"><thead><tr>
        ${[text.results.tierColumn, text.results.customersColumn, text.results.mrrColumn, text.results.revenueShareColumn].map(label => `<th scope="col">${label}</th>`).join("")}
      </tr></thead><tbody>${result.tiers.map((tier, index) => `<tr><td>${text.workflow.tier} ${index + 1}</td><td>${format.number(tier.customers)}</td><td>${format.money(tier.mrr)}</td><td>${format.percent(tier.revenueShare)}</td></tr>`).join("")}</tbody></table></div>
      <p class="tool-note">${text.results.tierNote}</p>`,
  };
}

function renderSubscriptions({ locale, text, currency }) {
  const format = views.formatters(locale, currency);
  const result = subscriptionCosts(subscriptions.map(item => ({ amount: views.toNumber(item.amount), period: item.period })));
  return {
    inputs: `${subscriptions.map((item, index) => `<fieldset class="subscription-item" data-subscription="${item.id}">
      <legend>${text.labels.serviceName} ${index + 1}</legend><div class="tool-inputs">
        ${field({ id: `service-${item.id}`, name: "name", label: text.labels.serviceName, value: item.name, type: "text" })}
        ${field({ id: `amount-${item.id}`, name: "amount", label: text.labels.subscriptionAmount, value: item.amount })}
        <label class="tool-field" for="period-${item.id}"><span>${text.labels.billingPeriod}</span>
          <select id="period-${item.id}" name="period"><option value="monthly"${item.period === "monthly" ? " selected" : ""}>${text.workflow.monthly}</option>
          <option value="annual"${item.period === "annual" ? " selected" : ""}>${text.workflow.yearly}</option></select></label>
      </div><div class="subscription-actions"><span data-share></span>
        <button type="button" class="tool-action" data-remove="${item.id}" aria-label="${text.workflow.removeService} ${index + 1}">${text.workflow.removeService}</button>
      </div></fieldset>`).join("")}
      ${subscriptions.length ? "" : `<p class="tool-note" role="status">${text.workflow.emptySubscriptions}</p>`}
      <button id="add-subscription" type="button" class="tool-action">${text.workflow.addService}</button>`,
    output: `<dl class="tool-results">${resultRow({ label: text.results.monthlyCost, value: format.money(result.monthly), strong: true })}
      ${resultRow({ label: text.results.annualCost, value: format.money(result.annual) })}</dl>`,
  };
}

search.addEventListener("input", renderCatalog);
directory.addEventListener("click", event => {
  const link = event.target.closest("[data-category]");
  if (!link || !catalog.hidden && !search.value) return;
  if (!catalog.hidden) { search.value = ""; renderCatalog(); }
});
form.addEventListener("submit", event => event.preventDefault());
function updateInput(event) {
  const input = event.target;
  if (!input.name) return;
  if (slug === "subscription-cost-calculator") {
    const row = input.closest("[data-subscription]");
    const item = subscriptions.find(item => item.id === Number(row?.dataset.subscription));
    if (!item || !["name", "amount", "period"].includes(input.name)) return;
    if (input.name === "period" && !["monthly", "annual"].includes(input.value)) return;
    item[input.name] = input.value;
  } else {
    // 只读取当前表单，场景切换后仍保留各自的输入。
    Object.assign(valuesForScenario(), Object.fromEntries(new FormData(form)));
  }
  renderCalculator(false);
}
form.addEventListener("input", updateInput);
form.addEventListener("change", updateInput);
form.addEventListener("click", event => {
  const remove = event.target.closest("[data-remove]");
  if (remove) {
    subscriptions = subscriptions.filter(item => item.id !== Number(remove.dataset.remove));
    renderCalculator();
    document.querySelector("#add-subscription").focus();
  } else if (event.target.closest("#add-subscription")) {
    const id = nextSubscriptionId++;
    subscriptions.push({ id, name: "", amount: "0", period: "monthly" });
    renderCalculator();
    document.querySelector(`#service-${id}`).focus();
  }
});
currencySelect.addEventListener("change", () => {
  if (isToolCurrency(currencySelect.value)) { currency = currencySelect.value; renderCalculator(); }
});
scenarioButtons.addEventListener("click", event => {
  const button = event.target.closest("[data-scenario]");
  if (!button) return;
  history.replaceState(null, "", `${location.pathname}${location.search}#${button.dataset.scenario}`);
  selectScenario();
  scenarioButtons.querySelector(`[data-scenario="${activeScenario.id}"]`).focus();
});
window.addEventListener("hashchange", () => { if (!detail.hidden) selectScenario(); });
window.addEventListener("scroll", updateActiveCategoryFromScroll, { passive: true });
window.addEventListener("resize", updateActiveCategoryFromScroll);

if (TOOL_SLUGS.includes(slug)) {
  catalog.hidden = true;
  detail.hidden = false;
  const tool = baseText.tools[slug];
  const category = toolCategoryOf(slug);
  document.title = `${tool.name} - Toolbox`;
  document.querySelector("#calculator-title").textContent = tool.heading;
  document.querySelector("#calculator-intro").textContent = tool.intro;
  document.querySelector("#calculator-category").textContent = baseText.categories[category];
  setActiveCategory(category);
  currencySelect.innerHTML = TOOL_CURRENCIES.map(code => `<option value="${code}"${code === currency ? " selected" : ""}>${baseText.currency.names[code]} ${code}</option>`).join("");
  selectScenario();
} else {
  renderCatalog();
  const category = TOOL_CATEGORIES.find(category => `#${category.id}` === location.hash);
  if (category) document.getElementById(category.id).scrollIntoView();
}
