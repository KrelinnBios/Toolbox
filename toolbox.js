const toolsTabs = document.querySelector("#tools-tabs");
const toolsSections = document.querySelector("#tools-sections");
const toolsCount = document.querySelector("#tools-count");
const toolsEmpty = document.querySelector("#tools-empty");
const siteSearch = document.querySelector("#site-search");
const toolsViewTitle = document.querySelector("#tools-view-title");
const toolsTotal = document.querySelector("#tools-total");

let searchQuery = "";
let scrollSpyLock = false;
let scrollSpyFrame = 0;
const siteNameCollator = new Intl.Collator("zh-u-co-pinyin", {
  numeric: true,
  sensitivity: "base",
});

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return url;
  }
}

function matchesQuery(item, category, query) {
  if (!query) return true;
  const haystack = `${hostOf(item.url)} ${item.name} ${item.desc} ${category.label}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function groupedItems(category) {
  const groups = new Map();
  category.items
    .filter((item) => matchesQuery(item, category, searchQuery))
    .forEach((item) => {
      const group = item.group || "其他";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(item);
    });

  return [...groups.entries()]
    .sort(([groupA], [groupB]) => siteNameCollator.compare(groupA, groupB))
    .map(([group, items]) => [
      group,
      items.sort((itemA, itemB) => siteNameCollator.compare(itemA.name, itemB.name)),
    ]);
}

function renderTabs() {
  const categories = [...siteCategories];
  const tabsHTML = `
    ${categories
      .map(
        (category, index) => `
      <button class="tools-tab category-${escapeHtml(category.id)}" type="button" data-category="${escapeHtml(category.id)}" aria-pressed="false">
        <span class="tools-tab-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <span class="tools-tab-label">${escapeHtml(category.label)}</span>
        <span class="tools-tab-count">${category.items.length}</span>
      </button>
    `,
      )
      .join("")}
  `;
  toolsTabs.innerHTML = tabsHTML;
}

function renderSections() {
  const visibleCategories = siteCategories.filter((category) =>
    category.items.some((item) => matchesQuery(item, category, searchQuery)),
  );

  const total = visibleCategories.reduce((sum, category) => {
    return sum + category.items.filter((item) => matchesQuery(item, category, searchQuery)).length;
  }, 0);

  toolsCount.textContent = "";
  toolsViewTitle.textContent = "";
  toolsViewTitle.hidden = true;
  toolsTotal.textContent = `共 ${total} 个站点`;
  toolsEmpty.hidden = total !== 0;

  toolsSections.innerHTML = visibleCategories
    .map((category) => {
      const groups = groupedItems(category);
      const items = groups.flatMap(([, groupItems]) => groupItems);
      return `
      <section class="tools-section category-${escapeHtml(category.id)}" data-category="${escapeHtml(category.id)}" aria-labelledby="title-${escapeHtml(category.id)}">
        <div class="tools-section-head">
          <span class="tools-section-number" aria-hidden="true">${String(siteCategories.indexOf(category) + 1).padStart(2, "0")}</span>
          <h2 class="tools-section-title" id="title-${escapeHtml(category.id)}">${escapeHtml(category.label)}</h2>
          <span class="tools-section-count">${items.length} 个站点</span>
        </div>
        <div class="tools-grid">
          ${items
            .map(
              (item) => `
            <a class="tools-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
              <span class="tools-card-icon" aria-hidden="true">
                <span>${escapeHtml(Array.from(item.name)[0].toUpperCase())}</span>
                <img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostOf(item.url))}&amp;sz=32" width="20" height="20" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">
              </span>
              <span class="tools-card-copy">
                <span class="tools-card-name">${escapeHtml(item.name)}</span>
                <span class="tools-card-desc">${escapeHtml(item.desc)}</span>
                <span class="tools-card-host">${escapeHtml(hostOf(item.url).replace(/^www\./, ""))}</span>
              </span>
            </a>
          `,
            )
            .join("")}
        </div>
      </section>
    `;
    })
    .join("");

}

function update() {
  toolsTabs.querySelectorAll(".tools-tab").forEach((tab) => {
    const isActive = tab.dataset.category === "all";
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
  renderSections();
  updateActiveCategoryFromScroll();
}

function setActiveTab(activeTab) {
  toolsTabs.querySelectorAll(".tools-tab").forEach((tab) => {
    const isActive = tab === activeTab;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
  if (activeTab) activeTab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
}

function updateActiveCategoryFromScroll() {
  if (scrollSpyFrame) return;
  scrollSpyFrame = window.requestAnimationFrame(() => {
    scrollSpyFrame = 0;
    if (scrollSpyLock || searchQuery) return;

    const sections = [...toolsSections.querySelectorAll(".tools-section")];
    const triggerY = window.innerHeight * 2 / 5;
    const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = null;
    if (reachedBottom) {
      current = sections.at(-1) || null;
    } else {
      sections.forEach((section) => {
        const top = section.getBoundingClientRect().top;
        if (top > 0 && top <= triggerY) current = section;
      });
    }

    if (current) {
      setActiveTab(toolsTabs.querySelector(`.tools-tab[data-category="${CSS.escape(current.dataset.category)}"]`));
    } else if (sections[0] && sections[0].getBoundingClientRect().top > triggerY) {
      setActiveTab(toolsTabs.querySelector('.tools-tab[data-category="all"]'));
    }
  });
}

toolsTabs.addEventListener("click", (event) => {
  const tab = event.target.closest(".tools-tab");
  if (!tab) return;
  if (searchQuery) {
    searchQuery = "";
    siteSearch.value = "";
    renderSections();
  }
  if (tab.dataset.category === "all") {
    scrollSpyLock = true;
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => { scrollSpyLock = false; }, 800);
    return;
  }

  const section = toolsSections.querySelector(`.tools-section[data-category="${CSS.escape(tab.dataset.category)}"]`);
  if (!section) return;
  scrollSpyLock = true;
  setActiveTab(tab);
  const targetTop = section.getBoundingClientRect().top + window.scrollY
    - Math.min(window.innerHeight * 2 / 5, 220) - 12;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  window.setTimeout(() => { scrollSpyLock = false; }, 800);
});

siteSearch.addEventListener("input", (event) => {
  searchQuery = event.target.value.trim();
  setActiveTab(toolsTabs.querySelector('.tools-tab[data-category="all"]'));
  update();
});

window.addEventListener("scroll", updateActiveCategoryFromScroll, { passive: true });
window.addEventListener("resize", updateActiveCategoryFromScroll);

toolsSections.addEventListener("load", (event) => {
  if (event.target.tagName !== "IMG") return;
  event.target.hidden = false;
  event.target.classList.add("is-loaded");
  event.target.previousElementSibling.hidden = true;
}, true);

toolsSections.addEventListener("error", (event) => {
  if (event.target.tagName !== "IMG") return;
  event.target.hidden = true;
  event.target.previousElementSibling.hidden = false;
}, true);

renderTabs();
update();
