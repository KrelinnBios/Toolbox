const toolsTabs = document.querySelector("#tools-tabs");
const toolsSections = document.querySelector("#tools-sections");
const toolsEmpty = document.querySelector("#tools-empty");
const siteSearch = document.querySelector("#site-search");
const toolsTotal = document.querySelector("#tools-total");

let searchQuery = "";
let scrollSpyLock = false;
let scrollSpyFrame = 0;
let scrollSpyUnlockTimer = 0;
let activeTab = null;
let sectionEntries = [];
const tabsByCategory = new Map();
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

const itemNameCollator = new Intl.Collator("zh-Hans-CN", {
  numeric: true,
  sensitivity: "base",
});

// 与 PrismSelf 首页保持一致：用户偏好减弱动态效果时瞬时定位，否则平滑滚动。
function scrollBehavior() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function groupedItems(category) {
  const groups = new Map();
  category.items.forEach((item) => {
    const group = item.group || "其他";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(item);
  });

  return [...groups.values()].flatMap((items) =>
    items.sort((itemA, itemB) => itemNameCollator.compare(itemA.name, itemB.name)),
  );
}

// 数据不随搜索变化：分组、排序、域名解析和搜索文本只准备一次。
const categoryData = siteCategories.map((category) => ({
  ...category,
  items: groupedItems(category).map((item) => {
    const host = hostOf(item.url);
    return {
      ...item,
      host,
      searchText: `${host} ${item.name} ${item.desc} ${category.label}`.toLowerCase(),
    };
  }),
}));

function renderTabs() {
  const categories = [...siteCategories];
  const tabsHTML = `
    ${categories
      .map(
        (category) => `
      <button class="tools-tab category-${escapeHtml(category.id)}" type="button" data-category="${escapeHtml(category.id)}" aria-pressed="false">
        <span class="tools-tab-label">${escapeHtml(category.label)}</span>
        <span class="tools-tab-count">${category.items.length}</span>
      </button>
    `,
      )
      .join("")}
  `;
  toolsTabs.innerHTML = tabsHTML;
  toolsTabs.querySelectorAll(".tools-tab").forEach((tab) => {
    tabsByCategory.set(tab.dataset.category, tab);
  });
}

function renderSections() {
  toolsSections.innerHTML = categoryData
    .map((category, index) => {
      const items = category.items;
      return `
      <section class="tools-section category-${escapeHtml(category.id)}" data-category="${escapeHtml(category.id)}" aria-labelledby="title-${escapeHtml(category.id)}">
        <div class="tools-section-head">
          <span class="tools-section-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
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
                <img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(item.host)}&amp;sz=32" width="20" height="20" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">
              </span>
              <span class="tools-card-copy">
                <span class="tools-card-name">${escapeHtml(item.name)}</span>
                <span class="tools-card-desc">${escapeHtml(item.desc)}</span>
                <span class="tools-card-host">${escapeHtml(item.host.replace(/^www\./, ""))}</span>
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

  sectionEntries = [...toolsSections.querySelectorAll(".tools-section")].map((section, index) => ({
    section,
    count: section.querySelector(".tools-section-count"),
    items: [...section.querySelectorAll(".tools-card")].map((card, itemIndex) => ({
      card,
      searchText: categoryData[index].items[itemIndex].searchText,
    })),
  }));
}

function update() {
  let total = 0;
  sectionEntries.forEach(({ section, count, items }) => {
    let visibleCount = 0;
    items.forEach(({ card, searchText }) => {
      const hidden = !searchText.includes(searchQuery);
      if (card.hidden !== hidden) card.hidden = hidden;
      if (!hidden) visibleCount++;
    });
    const hidden = visibleCount === 0;
    if (section.hidden !== hidden) section.hidden = hidden;
    const countText = `${visibleCount} 个站点`;
    if (count.textContent !== countText) count.textContent = countText;
    total += visibleCount;
  });
  const totalText = `共 ${total} 个站点`;
  if (toolsTotal.textContent !== totalText) toolsTotal.textContent = totalText;
  toolsEmpty.hidden = total !== 0;
  updateActiveCategoryFromScroll();
}

function setActiveTab(nextTab) {
  if (activeTab === nextTab) return;
  if (activeTab) {
    activeTab.classList.remove("is-active");
    activeTab.setAttribute("aria-pressed", "false");
  }
  activeTab = nextTab;
  if (activeTab) {
    activeTab.classList.add("is-active");
    activeTab.setAttribute("aria-pressed", "true");
  }
  if (!activeTab) return;
  if (window.matchMedia("(max-width: 800px)").matches) {
    // 滚动联动换分类时，横向目录条自己跟随移动，
    // 让激活按钮始终滚到可视区中央，不需要手动横滑查找。
    // 仍只通过 scrollBy 滚动横向目录，避免 scrollIntoView 打断页面正在进行的平滑滚动。
    const bounds = toolsTabs.getBoundingClientRect();
    const tabBounds = activeTab.getBoundingClientRect();
    const centerOffset = (tabBounds.left + tabBounds.right - bounds.left - bounds.right) / 2;
    if (Math.abs(centerOffset) >= 1) {
      toolsTabs.scrollBy({ left: centerOffset, behavior: scrollBehavior() });
    }
  } else {
    activeTab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: scrollBehavior() });
  }
}

function updateActiveCategoryFromScroll() {
  if (scrollSpyFrame) return;
  scrollSpyFrame = window.requestAnimationFrame(() => {
    scrollSpyFrame = 0;
    if (scrollSpyLock || searchQuery) return;

    // 触发线与点击定位共用同一组常量，与 PrismSelf 首页保持一致。
    const sidebarEl = document.querySelector(".tools-sidebar");
    const isMobileBar = window.matchMedia("(max-width: 800px)").matches;
    const stickyH = isMobileBar && sidebarEl ? sidebarEl.offsetHeight : 0;
    const triggerY = Math.min(window.innerHeight * 2 / 5, 220) + stickyH + 12;
    const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = null;
    if (reachedBottom) {
      current = sectionEntries.at(-1)?.section || null;
    } else {
      for (const { section } of sectionEntries) {
        if (section.getBoundingClientRect().top > triggerY) break;
        current = section;
      }
    }

    setActiveTab(current ? tabsByCategory.get(current.dataset.category) : null);
  });
}

toolsTabs.addEventListener("click", (event) => {
  const tab = event.target.closest(".tools-tab");
  if (!tab) return;
  if (searchQuery) {
    searchQuery = "";
    siteSearch.value = "";
    update();
  }

  const section = sectionEntries.find(({ section }) => section.dataset.category === tab.dataset.category)?.section;
  if (!section) return;

  // 与 PrismSelf 首页一致：再次点击已激活的分类即取消定位并回到页顶。
  if (activeTab === tab) {
    setActiveTab(null);
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    return;
  }

  const sidebarEl = document.querySelector(".tools-sidebar");
  const isMobileBar = window.matchMedia("(max-width: 800px)").matches;
  const stickyH = isMobileBar && sidebarEl ? sidebarEl.offsetHeight : 0;
  scrollSpyLock = true;
  setActiveTab(tab);
  const targetTop = section.getBoundingClientRect().top + window.scrollY
    - Math.min(window.innerHeight * 2 / 5, 220) - stickyH - 12;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: scrollBehavior() });
  window.clearTimeout(scrollSpyUnlockTimer);
  scrollSpyUnlockTimer = window.setTimeout(() => {
    scrollSpyLock = false;
    updateActiveCategoryFromScroll();
  }, 800);
});

siteSearch.addEventListener("keyup", (event) => {
  if (event.key !== "Escape") return;
  siteSearch.value = "";
  searchQuery = "";
  update();
});

siteSearch.addEventListener("input", (event) => {
  const nextQuery = event.target.value.trim().toLowerCase();
  if (searchQuery === nextQuery) return;
  searchQuery = nextQuery;
  setActiveTab(null);
  update();
});

window.addEventListener("scroll", updateActiveCategoryFromScroll, { passive: true });
window.addEventListener("resize", updateActiveCategoryFromScroll);

// iOS Safari 只有在存在 touchstart 监听时才会应用 :active 按压样式
document.addEventListener("touchstart", () => {}, { passive: true });

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
renderSections();
update();
