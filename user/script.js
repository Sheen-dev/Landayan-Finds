const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-nav]");

function showPage(id) {
  const targetPage = document.getElementById(id);

  if (!targetPage) return;

  pages.forEach((page) => {
    page.classList.toggle("active", page.id === id);
  });

  const parent = targetPage.dataset.parent || id;

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === parent);
  });

  if (location.hash !== `#${id}`) {
    history.replaceState(null, "", `#${id}`);
  }

  window.scrollTo(0, 0);
}

/* MOBILE MENU */

const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

function setMenu(open) {
  if (!menuToggle || !mainNav) return;

  mainNav.classList.toggle("open", open);
  menuToggle.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    setMenu(!mainNav.classList.contains("open"));
  });

  document.addEventListener("click", (event) => {
    if (
      mainNav.classList.contains("open") &&
      !event.target.closest("#main-nav") &&
      !event.target.closest("#menu-toggle")
    ) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 650) setMenu(false);
  });
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-page]");

  if (link) {
    showPage(link.dataset.page);
    setMenu(false);
  }
});

document.addEventListener("click", (event) => {
  const category = event.target.closest(".cat");

  if (!category) return;

  category.parentElement.querySelectorAll(".cat").forEach((item) => {
    item.classList.toggle("active", item === category);
  });
});

const start = location.hash.slice(1);

showPage(document.getElementById(start) ? start : "home");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* FULL-SCREEN IMAGE VIEWER */

const imageViewerStyles = document.createElement("style");

imageViewerStyles.textContent = `
  .image-viewer[hidden] {
    display: none !important;
  }

  .image-viewer:not([hidden]) {
    position: fixed !important;
    inset: 0 !important;
    z-index: 999999 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    padding: 20px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: rgba(0, 0, 0, 0.96) !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }

  .image-viewer-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 0;
    min-height: 0;
  }

  .image-viewer-content img {
    display: block;
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: calc(100vh - 75px) !important;
    max-height: calc(100dvh - 75px) !important;
    object-fit: contain !important;
    object-position: center;
    border-radius: 4px;
    box-shadow: none;
  }

  .image-viewer-content p {
    color: white;
    font-size: 13px;
    text-align: center;
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  .image-viewer-close {
    position: absolute !important;
    top: 15px !important;
    right: 18px !important;
    z-index: 2;
    width: 44px !important;
    height: 44px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: 0 !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.16) !important;
    color: white !important;
    font-size: 25px !important;
    cursor: pointer;
  }

  .image-viewer-close:hover {
    background: rgba(255, 255, 255, 0.3) !important;
  }

  body.image-viewer-open {
    overflow: hidden !important;
  }

  @media (max-width: 650px) {
    .image-viewer:not([hidden]) {
      padding: 10px !important;
    }

    .image-viewer-content img {
      max-width: 100% !important;
      max-height: calc(100vh - 65px) !important;
      max-height: calc(100dvh - 65px) !important;
    }

    .image-viewer-close {
      top: 10px !important;
      right: 10px !important;
    }
  }
`;

document.head.appendChild(imageViewerStyles);

const imageViewer = document.createElement("div");

imageViewer.className = "image-viewer";
imageViewer.setAttribute("role", "dialog");
imageViewer.setAttribute("aria-modal", "true");
imageViewer.setAttribute("aria-label", "Full image viewer");
imageViewer.hidden = true;

imageViewer.innerHTML = `
  <button type="button" class="image-viewer-close" aria-label="Close image">
    <i class="ti ti-x"></i>
  </button>
  <div class="image-viewer-content">
    <img src="" alt="">
    <p></p>
  </div>
`;

document.body.appendChild(imageViewer);

const imageViewerImage = imageViewer.querySelector("img");
const imageViewerCaption = imageViewer.querySelector("p");
const imageViewerClose = imageViewer.querySelector(".image-viewer-close");

let previousFocusedElement = null;

function openImageViewer(image) {
  if (!image || !image.src) return;

  previousFocusedElement = document.activeElement;

  imageViewerImage.src = image.currentSrc || image.src;
  imageViewerImage.alt = image.alt || "Business image";
  imageViewerCaption.textContent = image.alt || "";

  imageViewer.hidden = false;
  document.body.classList.add("image-viewer-open");

  imageViewerClose.focus();
}

function closeImageViewer() {
  if (imageViewer.hidden) return;

  imageViewer.hidden = true;
  imageViewerImage.removeAttribute("src");
  imageViewerImage.alt = "";
  imageViewerCaption.textContent = "";

  document.body.classList.remove("image-viewer-open");

  if (previousFocusedElement && previousFocusedElement.focus) {
    previousFocusedElement.focus();
  }

  previousFocusedElement = null;
}

document.addEventListener("click", (event) => {
  const image = event.target.closest("#shop-details img");

  if (!image || imageViewer.contains(event.target)) return;

  openImageViewer(image);
});

imageViewerClose.addEventListener("click", closeImageViewer);

imageViewer.addEventListener("click", (event) => {
  if (
    event.target === imageViewer ||
    event.target === imageViewer.querySelector(".image-viewer-content")
  ) {
    closeImageViewer();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !imageViewer.hidden) {
    closeImageViewer();
  }
});

/* BUSINESS LISTINGS */

let businessListings = [];
let businessesLoadFailed = false;

const featuredList = document.getElementById("featured-list");
const businessResults = document.getElementById("business-results");
const businessSearchInput = document.getElementById("business-search-input");
const businessSearchButton = document.getElementById("business-search-button");
const businessResultsCount = document.getElementById("business-results-count");
const businessResultsLabel = document.getElementById("business-results-label");
const businessesEmpty = document.getElementById("businesses-empty");
const businessesPagination = document.getElementById("businesses-pagination");
const businessSort = document.getElementById("business-sort");
const clearBusinessFilters = document.getElementById("clear-business-filters");

let selectedBusinessCategory = "All";
let currentBusinessPage = 1;
const businessesPerPage = 4;

/* KEYWORD SEARCH: placeholders now say that keywords work */

const SEARCH_PLACEHOLDER = "Search by name, product, or service (e.g. haircut)";

if (businessSearchInput) {
  businessSearchInput.placeholder = SEARCH_PLACEHOLDER;
}

const CATEGORY_STYLE = {
  "Food and Beverages": { cls: "cat-food", icon: "tools-kitchen-2" },
  "Services": { cls: "cat-services", icon: "tool" },
  "Stores": { cls: "cat-retail", icon: "building-store" },
  "Health and Care": { cls: "cat-health", icon: "heartbeat" },
  "Others": { cls: "cat-others", icon: "category" }
};

function categoryStyle(category) {
  return CATEGORY_STYLE[category] || CATEGORY_STYLE.Others;
}

/* KEYWORD SEARCH HELPERS
   A business matches when EVERY word typed is found in its
   name, category, about text, or its products and services.
   Words with the same meaning (synonyms) also count, for example
   "clothes" finds "streetwear" and "haircut" finds "barbershop". */

// each line is one group of words that mean almost the same thing
// add your own words here any time
const SEARCH_GROUPS = [
  ["clothes", "clothing", "clothe", "apparel", "streetwear", "garment", "fashion",
   "shirt", "tshirt", "t-shirt", "polo", "pants", "shorts", "jeans", "jacket",
   "hoodie", "dress", "outfit", "damit", "thrift", "ukay"],
  ["haircut", "hair", "barber", "barbershop", "salon", "gupit", "hairstyle"],
  ["food", "restaurant", "meal", "eatery", "karinderya", "kain"],
  ["bread", "bakery", "bakeshop", "cake", "pastry", "mamon", "tinapay"],
  ["medicine", "pharmacy", "drugstore", "botika", "gamot"],
  ["shoes", "footwear", "sneakers", "sandals", "sapatos"]
];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// returns the other words that mean the same as the typed word
function relatedWords(word) {
  if (word.length < 3) return [];

  const related = [];

  SEARCH_GROUPS.forEach((group) => {
    const inGroup = group.some(
      (term) => term.startsWith(word) || word.startsWith(term)
    );

    if (inGroup) {
      group.forEach((term) => {
        if (!related.includes(term)) related.push(term);
      });
    }
  });

  return related;
}

// finds a related word at the START of a word in the text
// (so "dress" does not match "address")
function findRelatedInText(text, word) {
  return relatedWords(word).find((term) =>
    new RegExp("\\b" + escapeRegex(term)).test(text)
  );
}

function businessSearchText(business) {
  if (!business._searchText) {
    const parts = [
      business.name,
      business.category,
      business.info
    ];

    (business.products || []).forEach((item) => {
      parts.push(item.name, item.description);
    });

    business._searchText = parts
      .map((part) => String(part || ""))
      .join(" ")
      .toLowerCase();
  }

  return business._searchText;
}

function searchWords(term) {
  return String(term || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function matchesKeywords(business, term) {
  const words = searchWords(term);

  if (words.length === 0) return true;

  const text = businessSearchText(business);

  return words.every(
    (word) => text.includes(word) || findRelatedInText(text, word) !== undefined
  );
}

// finds the product/service that matched (used to explain the result)
function matchedItemName(business, term) {
  const words = searchWords(term);

  if (words.length === 0) return "";

  const found = (business.products || []).find((item) => {
    const text = `${item.name || ""} ${item.description || ""}`.toLowerCase();

    return words.some(
      (word) => text.includes(word) || findRelatedInText(text, word) !== undefined
    );
  });

  return found ? found.name : "";
}

// when no product matched, shows the related word found in the shop text
// example: searching "clothes" shows "streetwear"
function matchedKeyword(business, term) {
  const text = businessSearchText(business);

  for (const word of searchWords(term)) {
    if (text.includes(word)) return "";

    const related = findRelatedInText(text, word);

    if (related) return related;
  }

  return "";
}

/* IMAGE PATH AND URL SUPPORT */

function safeImagePath(path) {
  if (typeof path !== "string") return "";

  const image = path.trim();

  if (!image) return "";

  const isExternalUrl = /^https?:\/\/[^\s"'<>]+$/i.test(image);

  const isLocalPath =
    /^uploads\/[\w\-./]+$/.test(image) &&
    !image.includes("..");

  return isExternalUrl || isLocalPath ? image : "";
}

function imageOrPlaceholder(path, category, icon, altText) {
  const src = safeImagePath(path);

  if (src) {
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(altText)}" loading="lazy">`;
  }

  const style = categoryStyle(category);

  return `<div class="photo-fallback ${style.cls}">
            <i class="ti ti-${icon}" aria-hidden="true"></i>
          </div>`;
}

function renderFeaturedBusinesses() {
  if (!featuredList) return;

  const categories = [
    "Food and Beverages",
    "Services",
    "Stores",
    "Health and Care",
    "Others"
  ];

  const featuredBusinesses = categories
    .map((category) =>
      businessListings.find((business) => business.category === category)
    )
    .filter(Boolean);

  businessListings.forEach((business) => {
    if (
      featuredBusinesses.length < 5 &&
      !featuredBusinesses.includes(business)
    ) {
      featuredBusinesses.push(business);
    }
  });

  featuredBusinesses.splice(5);

  featuredList.innerHTML = "";

  if (featuredBusinesses.length === 0) {
    featuredList.textContent = businessesLoadFailed
      ? "Featured businesses could not be loaded. Please try again later."
      : "No featured businesses are available yet.";
    return;
  }

  featuredBusinesses.forEach((business) => {
    const style = categoryStyle(business.category);
    const card = document.createElement("article");

    card.className = "card";
    card.innerHTML = `
      <div class="card-media">
        ${imageOrPlaceholder(
          business.profile || business.cover,
          business.category,
          style.icon,
          business.name
        )}
      </div>

      <div class="card-content">
        <span class="featured-category">${escapeHtml(business.category)}</span>
        <h3>${escapeHtml(business.name)}</h3>
        <p>${escapeHtml(business.info || "Discover this local business in Barangay Landayan.")}</p>
        <div class="card-action">
          <button type="button" class="btn" data-featured-business-id="${escapeHtml(business.id)}">
            View Business
          </button>
        </div>
      </div>
    `;

    featuredList.appendChild(card);
  });
}

/* OPEN NOW */

const openNowList = document.getElementById("open-now-list");

function formatClock(time) {
  const [hour, minute] = String(time || "").split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return "";

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function renderOpenNowBusinesses() {
  if (!openNowList) return;

  const openBusinesses = businessListings
    .filter((business) => getOpenStatus(business) === true)
    .slice(0, 5);

  openNowList.innerHTML = "";

  if (openBusinesses.length === 0) {
    openNowList.textContent = businessesLoadFailed
      ? "Businesses could not be loaded. Please try again later."
      : "No businesses are open right now.";
    return;
  }

  openBusinesses.forEach((business) => {
    const style = categoryStyle(business.category);
    const card = document.createElement("article");

    card.className = "card";
    card.innerHTML = `
      <div class="card-media">
        ${imageOrPlaceholder(
          business.profile || business.cover,
          business.category,
          style.icon,
          business.name
        )}
      </div>

      <div class="card-content">
                <span class="featured-category open-badge">
          ${escapeHtml(business.is247 ? "Open 24/7" : "Open until " + formatClock(business.closeTime))}
        </span>
        <h3>${escapeHtml(business.name)}</h3>
        <p>${escapeHtml(business.info || "Discover this local business in Barangay Landayan.")}</p>
        <div class="card-action">
          <button type="button" class="btn" data-open-business-id="${escapeHtml(business.id)}">
            View Business
          </button>
        </div>
      </div>
    `;

    openNowList.appendChild(card);
  });
}

if (openNowList) {
  openNowList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-business-id]");

    if (!button) return;

    const business = businessListings.find(
      (item) => String(item.id) === button.dataset.openBusinessId
    );

    if (business) {
      showBusinessDetails(business);
    }
  });
}

// keep the list accurate while the page stays open
setInterval(() => {
  renderOpenNowBusinesses();
  renderBusinesses();
}, 60000);

const openNowViewAll = document.getElementById("open-now-view-all");

if (openNowViewAll) {
  openNowViewAll.addEventListener("click", () => {
    setCategoryAll();
    businessSearchInput.value = "";
    businessSort.value = "open";
    resetBusinessPage();
  });
}

function getOpenStatus(business) {
    if (business.is247) return true;
  if (!business.openTime || !business.closeTime) return null;

  const toMinutes = (time) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const open = toMinutes(business.openTime);
  const close = toMinutes(business.closeTime);

  return open <= close
    ? current >= open && current < close
    : current >= open || current < close;
}
function statusText(business) {
  if (business.is247) return "Open 24/7";
  const status = getOpenStatus(business);
  if (status === null) return "";
  return status ? `Open until ${formatClock(business.closeTime)}` : "Closed";
}

async function loadBusinesses() {
  businessResultsLabel.textContent = "Loading businesses...";

  try {
    const response = await fetch("api/businesses.php");
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to load businesses.");
    }

    businessListings = result.businesses;
    businessesLoadFailed = false;
  } catch (error) {
    console.error(error);
    businessListings = [];
    businessesLoadFailed = true;
  }

   renderBusinesses();
  renderFeaturedBusinesses();
  renderOpenNowBusinesses();

  if (location.hash === "#shop-details") {
    const savedBusinessId = localStorage.getItem("landayanfinds_active_business");

    const savedBusiness = businessListings.find(
      (business) => String(business.id) === savedBusinessId
    );

    if (savedBusiness) {
      showBusinessDetails(savedBusiness, true);
    } else {
      showPage("businesses");
    }
  }
}

/* SEARCH BY KEYWORD (name, category, about, products and services).
   Category filter is ignored while searching. */

function getFilteredBusinesses() {
  const searchTerm = businessSearchInput.value.trim().toLowerCase();

  const filtered = businessListings.filter((business) => {
    const matchesSearch = matchesKeywords(business, searchTerm);

    // while something is being searched, the category filter is ignored
    const matchesCategory =
      searchTerm !== "" ||
      selectedBusinessCategory === "All" ||
      business.category === selectedBusinessCategory;

    return matchesSearch && matchesCategory;
  });

    const sortValue = businessSort.value;

  if (sortValue === "name") {
    filtered.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  } else if (sortValue === "category") {
    filtered.sort((a, b) =>
      String(a.category).localeCompare(String(b.category))
    );
  } else if (sortValue === "open") {
    const rank = (business) => {
      const status = getOpenStatus(business);
      return status === true ? 0 : status === false ? 1 : 2;
    };

    filtered.sort(
      (a, b) =>
        rank(a) - rank(b) || String(a.name).localeCompare(String(b.name))
    );
  }

  return filtered;
}

function renderBusinesses() {
  const filtered = getFilteredBusinesses();

  const total = filtered.length;
  const totalPages = Math.ceil(total / businessesPerPage);

  if (currentBusinessPage > totalPages && totalPages > 0) {
    currentBusinessPage = totalPages;
  }

  if (totalPages === 0) {
    currentBusinessPage = 1;
  }

  const startIndex = (currentBusinessPage - 1) * businessesPerPage;
  const displayed = filtered.slice(startIndex, startIndex + businessesPerPage);

  businessResults.innerHTML = "";

  businessResultsCount.textContent =
    `${total} ${total === 1 ? "business" : "businesses"} available`;

  businessResultsLabel.textContent =
    total > 0
      ? `Showing ${startIndex + 1}-${Math.min(
          startIndex + businessesPerPage,
          total
        )} of ${total} businesses`
      : "No businesses found";

  businessesEmpty.hidden = total !== 0;

  if (businessesLoadFailed) {
    businessesEmpty.textContent =
      "We could not load the businesses. Please try again later.";
  } else if (businessListings.length === 0) {
    businessesEmpty.textContent = "No businesses are currently available.";
  } else {
    businessesEmpty.textContent = "No businesses match your search.";
  }

  displayed.forEach((business) => {
    const style = categoryStyle(business.category);
    const openStatus = getOpenStatus(business);

        const label = statusText(business);
    const statusBadge = !label
      ? ""
      : `<span class="biz-status ${openStatus ? "is-open" : "is-closed"}">${escapeHtml(label)}</span>`;
    const tags = (business.products || [])
      .slice(0, 3)
      .map((item) => `<span class="job-tag">${escapeHtml(item.name)}</span>`)
      .join("");

    const card = document.createElement("article");
    card.className = "job-card";

    card.innerHTML = `
      <div class="biz-thumb">
        ${imageOrPlaceholder(
          business.profile,
          business.category,
          style.icon,
          business.name
        )}
      </div>

      <div class="job-card-content">
        <h3>${escapeHtml(business.name)}</h3>
                <p class="job-card-business">${escapeHtml(business.category)} ${statusBadge}</p>

        <div class="job-card-meta">
          <span>Address: ${escapeHtml(business.address)}</span>
          <span>Hours: ${escapeHtml(business.hours)}</span>
        </div>

        <div class="job-card-tags">${tags}</div>
      </div>

      <div class="job-card-action">
        <button type="button" data-business-id="${escapeHtml(business.id)}">
          View Details →
        </button>
      </div>
    `;

    businessResults.appendChild(card);
  });

  renderBusinessPagination(totalPages);
}

function renderBusinessPagination(totalPages) {
  businessesPagination.innerHTML = "";

  if (totalPages <= 1) return;

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.textContent = "Previous";
  previousButton.disabled = currentBusinessPage === 1;

  previousButton.addEventListener("click", () => {
    if (currentBusinessPage > 1) {
      currentBusinessPage--;
      renderBusinesses();
    }
  });

  businessesPagination.appendChild(previousButton);

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = page;

    if (page === currentBusinessPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      currentBusinessPage = page;
      renderBusinesses();
    });

    businessesPagination.appendChild(button);
  }

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.textContent = "Next";
  nextButton.disabled = currentBusinessPage === totalPages;

  nextButton.addEventListener("click", () => {
    if (currentBusinessPage < totalPages) {
      currentBusinessPage++;
      renderBusinesses();
    }
  });

  businessesPagination.appendChild(nextButton);
}

function resetBusinessPage() {
  currentBusinessPage = 1;
  renderBusinesses();
}

/* sets the category back to "All" (variable + buttons + mobile summary) */

function setCategoryAll() {
  selectedBusinessCategory = "All";

  document.querySelectorAll("[data-business-category]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.businessCategory === "All"
    );
  });

  const summary = document.querySelector(".filter-toggle-summary");
  const badge = document.querySelector(".filter-badge");

  if (summary) summary.textContent = "All categories";

  if (badge) {
    badge.textContent = "0";
    badge.hidden = true;
  }
}

if (businessSearchInput) {
  businessSearchInput.addEventListener("input", () => {
    if (businessSearchInput.value.trim() !== "") {
      setCategoryAll();
    }

    resetBusinessPage();
  });
}

if (businessSearchButton) {
  businessSearchButton.addEventListener("click", () => {
    if (businessSearchInput.value.trim() !== "") {
      setCategoryAll();
    }

    resetBusinessPage();
  });
}

/* HOME PAGE SEARCH */

const homeSearchInput = document.getElementById("home-search-input");
const homeSearchButton = document.getElementById("home-search-button");

if (homeSearchInput) {
  homeSearchInput.placeholder = SEARCH_PLACEHOLDER;
}

function runHomeSearch() {
  if (!homeSearchInput) return;

  const keyword = homeSearchInput.value.trim();

  setCategoryAll();

  businessSearchInput.value = keyword;
  businessSort.value = "name";

  hideHomeSuggestions();
  showPage("businesses");
  resetBusinessPage();
}

if (homeSearchButton) {
  homeSearchButton.addEventListener("click", runHomeSearch);
}

/* HOME PAGE SEARCH DROPDOWN */

const homeSuggestionStyles = document.createElement("style");

homeSuggestionStyles.textContent = `
  .cover {
    z-index: 5;
  }

  .home-suggestions {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    z-index: 9999;
    margin: 0;
    padding: 6px;
    list-style: none;
    max-height: 320px;
    overflow-y: auto;
    text-align: left;
    background: #fff;
    border: 1px solid #dce5e1;
    border-radius: 10px;
    box-shadow: 0 14px 30px rgba(6, 86, 79, 0.18);
  }

  .home-suggestions[hidden] {
    display: none;
  }

  .home-suggestions-empty {
    padding: 14px 10px;
    color: #788680;
    font-size: 13px;
  }

  .home-suggestion {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    color: #173d37;
  }

  .home-suggestion:hover,
  .home-suggestion.active {
    background: #e6f7f0;
  }

  .home-suggestion-thumb {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid #e1e8e5;
    border-radius: 8px;
    background: #fff;
  }

  .home-suggestion-thumb img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }

  .home-suggestion-thumb .photo-fallback {
    font-size: 18px;
  }

  .home-suggestion-text {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .home-suggestion-text strong {
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-suggestion-text strong b {
    font-weight: 700;
    color: #087f70;
  }

  .home-suggestion-text small {
    color: #087f70;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

document.head.appendChild(homeSuggestionStyles);

const homeSuggestions = document.createElement("ul");

homeSuggestions.className = "home-suggestions";
homeSuggestions.id = "home-suggestions";
homeSuggestions.setAttribute("role", "listbox");
homeSuggestions.hidden = true;

let suggestionBusinesses = [];
let activeSuggestionIndex = -1;

if (homeSearchInput) {
  const homeSearchBox = homeSearchInput.closest(".search");

  if (homeSearchBox) {
    homeSearchBox.appendChild(homeSuggestions);
  }

  homeSearchInput.setAttribute("autocomplete", "off");
  homeSearchInput.setAttribute("aria-controls", "home-suggestions");
}

function hideHomeSuggestions() {
  homeSuggestions.hidden = true;
  homeSuggestions.innerHTML = "";
  suggestionBusinesses = [];
  activeSuggestionIndex = -1;
}

function getSuggestedBusinesses(term) {
  const keyword = term.trim().toLowerCase();

  if (!keyword) return [];

  // 0 = name starts with it, 1 = name contains it, 2 = matched by keyword only
  const rank = (business) => {
    const name = String(business.name || "").toLowerCase();

    if (name.startsWith(keyword)) return 0;
    if (name.includes(keyword)) return 1;
    return 2;
  };

  return businessListings
    .filter((business) => matchesKeywords(business, keyword))
    .sort(
      (a, b) =>
        rank(a) - rank(b) || String(a.name).localeCompare(String(b.name))
    )
    .slice(0, 6);
}

function highlightMatch(name, term) {
  const text = String(name || "");
  const index = text.toLowerCase().indexOf(term.trim().toLowerCase());

  if (index === -1 || !term.trim()) return escapeHtml(text);

  const end = index + term.trim().length;

  return (
    escapeHtml(text.slice(0, index)) +
    "<b>" + escapeHtml(text.slice(index, end)) + "</b>" +
    escapeHtml(text.slice(end))
  );
}

function setActiveSuggestion(index) {
  homeSuggestions.querySelectorAll(".home-suggestion").forEach((item, itemIndex) => {
    item.classList.toggle("active", itemIndex === index);
    item.setAttribute("aria-selected", String(itemIndex === index));
  });

  activeSuggestionIndex = index;
}

function renderHomeSuggestions() {
  if (!homeSearchInput) return;

  const term = homeSearchInput.value;

  // dropdown only appears while something is being typed
  if (!term.trim()) {
    hideHomeSuggestions();
    return;
  }

  suggestionBusinesses = getSuggestedBusinesses(term);
  activeSuggestionIndex = -1;
  homeSuggestions.innerHTML = "";

  if (suggestionBusinesses.length === 0) {
    const empty = document.createElement("li");

    empty.className = "home-suggestions-empty";
    empty.textContent = "No business found for that keyword.";
    homeSuggestions.appendChild(empty);
    homeSuggestions.hidden = false;
    return;
  }

  suggestionBusinesses.forEach((business, index) => {
    const style = categoryStyle(business.category);
    const item = document.createElement("li");

    // when the name does not contain the keyword, show the matching item
    const nameHasTerm = String(business.name || "")
      .toLowerCase()
      .includes(term.trim().toLowerCase());
    const itemMatch = nameHasTerm
      ? ""
      : matchedItemName(business, term) || matchedKeyword(business, term);
    const subtitle = itemMatch
      ? `${business.category} · ${itemMatch}`
      : business.category;

    item.className = "home-suggestion";
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", "false");
    item.dataset.suggestionIndex = String(index);

    item.innerHTML = `
      <span class="home-suggestion-thumb">
        ${imageOrPlaceholder(
          business.profile || business.cover,
          business.category,
          style.icon,
          business.name
        )}
      </span>
      <span class="home-suggestion-text">
        <strong>${highlightMatch(business.name, term)}</strong>
        <small>${escapeHtml(subtitle)}</small>
      </span>
    `;

    homeSuggestions.appendChild(item);
  });

  homeSuggestions.hidden = false;
}

function chooseSuggestion(index) {
  const business = suggestionBusinesses[index];

  if (!business) return;

  homeSearchInput.value = business.name;
  hideHomeSuggestions();
  showBusinessDetails(business);
}

if (homeSearchInput) {
  homeSearchInput.addEventListener("input", renderHomeSuggestions);
  homeSearchInput.addEventListener("focus", renderHomeSuggestions);

  homeSearchInput.addEventListener("keydown", (event) => {
    const isOpen = !homeSuggestions.hidden && suggestionBusinesses.length > 0;

    if (event.key === "ArrowDown" && isOpen) {
      event.preventDefault();
      setActiveSuggestion((activeSuggestionIndex + 1) % suggestionBusinesses.length);
      return;
    }

    if (event.key === "ArrowUp" && isOpen) {
      event.preventDefault();
      setActiveSuggestion(
        (activeSuggestionIndex - 1 + suggestionBusinesses.length) %
          suggestionBusinesses.length
      );
      return;
    }

    if (event.key === "Escape") {
      hideHomeSuggestions();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (isOpen && activeSuggestionIndex >= 0) {
        chooseSuggestion(activeSuggestionIndex);
      } else {
        runHomeSearch();
      }
    }
  });
}

// mousedown fires before the input loses focus, so the click is never lost
homeSuggestions.addEventListener("mousedown", (event) => {
  const item = event.target.closest(".home-suggestion");

  if (!item) return;

  event.preventDefault();
  chooseSuggestion(Number(item.dataset.suggestionIndex));
});

document.addEventListener("click", (event) => {
  if (
    !event.target.closest("#home-suggestions") &&
    event.target !== homeSearchInput
  ) {
    hideHomeSuggestions();
  }
});

if (businessSort) {
  businessSort.addEventListener("change", resetBusinessPage);
}

document.querySelectorAll("[data-business-category]").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-business-category]")
      .forEach((item) => item.classList.remove("active"));

    button.classList.add("active");
    selectedBusinessCategory = button.dataset.businessCategory;

    // choosing a category clears the search so the two don't conflict
    businessSearchInput.value = "";

    resetBusinessPage();
  });
});

if (clearBusinessFilters) {
  clearBusinessFilters.addEventListener("click", () => {
    businessSearchInput.value = "";
    businessSort.value = "name";

    setCategoryAll();
    resetBusinessPage();
  });
}

/* SHOP DETAILS PAGE */

let activeShopBusinessId = null;

function setShopTab(name, save = true) {
  const validTabs = ["items", "photos"];

  if (!validTabs.includes(name)) {
    name = "items";
  }

  document.querySelectorAll("[data-shop-tab]").forEach((tab) => {
    const isActive = tab.dataset.shopTab === name;

    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".shop-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `shop-panel-${name}`);
  });

  if (save && activeShopBusinessId !== null) {
    localStorage.setItem(
      `landayanfinds_shop_tab_${activeShopBusinessId}`,
      name
    );
  }
}

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-shop-tab]");

  if (tab) {
    setShopTab(tab.dataset.shopTab);
  }
});

function itemCardHtml(item, business) {
  const isProduct = item.type === "product";

  return `
    <article class="item-card">
      <div class="item-photo">
        ${imageOrPlaceholder(
          item.image,
          business.category,
          isProduct ? "package" : "tool",
          item.name
        )}
      </div>

      <div class="item-body">
        <span class="item-type">${isProduct ? "Product" : "Service"}</span>
        <h3>${escapeHtml(item.name)}</h3>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
        ${item.price ? `<strong class="item-price">${escapeHtml(item.price)}</strong>` : ""}
      </div>
    </article>
  `;
}

function showBusinessDetails(business, restoring = false) {
  const style = categoryStyle(business.category);
  const items = business.products || [];
  const photos = (business.photos || []).filter((path) => safeImagePath(path));

  const shopCover = document.getElementById("shop-cover");
  const profileWrapper = document.getElementById("shop-profile");
  const profileImage = document.getElementById("shop-detail-profile");

  activeShopBusinessId = String(business.id);

  localStorage.setItem(
    "landayanfinds_active_business",
    activeShopBusinessId
  );

  shopCover.innerHTML = imageOrPlaceholder(
    business.cover || photos[0],
    business.category,
    style.icon,
    `${business.name} cover`
  );

  const profilePath = safeImagePath(business.profile);

  if (profilePath) {
    profileImage.src = profilePath;
    profileImage.alt = `${business.name} profile`;
    profileWrapper.hidden = false;
  } else {
    profileImage.removeAttribute("src");
    profileWrapper.hidden = true;
  }

  document.getElementById("shop-detail-title").textContent = business.name;
  document.getElementById("shop-detail-category").textContent = business.category;

  const status = document.getElementById("shop-detail-status");
  const openNow = getOpenStatus(business);

  if (openNow === null) {
    status.hidden = true;
  } else {
    status.hidden = false;
    status.textContent = statusText(business);
    status.classList.toggle("is-closed", !openNow);
  }

  document.getElementById("shop-detail-info").textContent = business.info || "";
  document.getElementById("shop-detail-address").textContent = business.address || "";
  document.getElementById("shop-detail-hours").textContent = business.hours || "";
  document.getElementById("shop-detail-contact").textContent = business.contact || "";

  const emailLink = document.getElementById("shop-detail-email");
  const facebookLink = document.getElementById("shop-detail-facebook");

  if (business.email) {
    emailLink.textContent = business.email;
    emailLink.href = `mailto:${business.email}`;
    emailLink.parentElement.parentElement.hidden = false;
  } else {
    emailLink.textContent = "Not provided";
    emailLink.removeAttribute("href");
    emailLink.parentElement.parentElement.hidden = false;
  }

  const facebookUrl = (business.facebook || "").trim();

  if (
    /^https:\/\/(www\.)?facebook\.com\/[^\s]+$/i.test(facebookUrl)
  ) {
    facebookLink.href = facebookUrl;
    facebookLink.textContent = "Visit Facebook page";
    facebookLink.target = "_blank";
    facebookLink.rel = "noopener noreferrer";
  } else {
    facebookLink.textContent = "Not Provided";
    facebookLink.removeAttribute("href");
    facebookLink.removeAttribute("target");
  }

  facebookLink.parentElement.parentElement.hidden = false;

  document.getElementById("shop-items-count").textContent = `(${items.length})`;

  document.getElementById("shop-panel-items").innerHTML = items.length
    ? `<div class="item-grid">${items
        .map((item) => itemCardHtml(item, business))
        .join("")}</div>`
    : `<p class="shop-empty">This shop has not listed any products or services yet.</p>`;

  document.getElementById("shop-photos-count").textContent = `(${photos.length})`;

  document.getElementById("shop-panel-photos").innerHTML = photos.length
    ? `<div class="photo-grid">${photos
        .map(
          (photo, index) =>
            `<figure><img src="${escapeHtml(photo)}" alt="${escapeHtml(
              business.name
            )} photo ${index + 1}" loading="lazy"></figure>`
        )
        .join("")}</div>`
    : `<p class="shop-empty">No photos have been added yet.</p>`;

  const mapBox = document.getElementById("shop-detail-map");

  mapBox.innerHTML = "";

  if (
    business.mapSrc &&
    business.mapSrc.startsWith("https://www.google.com/maps")
  ) {
    const frame = document.createElement("iframe");

    frame.src = business.mapSrc;
    frame.title = `Map of ${business.name}`;
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer-when-downgrade";

    mapBox.appendChild(frame);
  } else {
    mapBox.innerHTML = `
      <div class="map-empty">
        <i class="ti ti-map-pin" aria-hidden="true"></i>
        <span>The map for this shop has not been added yet.</span>
      </div>`;
  }

  const savedTab = localStorage.getItem(
    `landayanfinds_shop_tab_${activeShopBusinessId}`
  );

  setShopTab(restoring ? savedTab || "items" : "items", !restoring);
  showPage("shop-details");
}

if (featuredList) {
  featuredList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-featured-business-id]");

    if (!button) return;

    const business = businessListings.find(
      (item) => String(item.id) === button.dataset.featuredBusinessId
    );

    if (business) {
      showBusinessDetails(business);
    }
  });
}

if (businessResults) {
  businessResults.addEventListener("click", (event) => {
    const button = event.target.closest("[data-business-id]");

    if (!button) return;

    const business = businessListings.find(
      (item) => String(item.id) === button.dataset.businessId
    );

    if (business) {
      showBusinessDetails(business);
    }
  });
}

loadBusinesses();

/* BUSINESS FILTER PANELS */

document.querySelectorAll(".jobs-sidebar").forEach((sidebar) => {
  const toggle = sidebar.querySelector(".filter-toggle");
  const summary = sidebar.querySelector(".filter-toggle-summary");
  const badge = sidebar.querySelector(".filter-badge");
  const clearButton = sidebar.querySelector(".filter-clear");
  const originalClear = sidebar.querySelector(".jobs-filter-heading button");

  if (!toggle) return;

  function updateFilterSummary() {
    const activeCategory = sidebar.querySelector(".job-category.active");
    const categoryText = activeCategory ? activeCategory.textContent.trim() : "";
    const categoryChosen =
      activeCategory &&
      activeCategory.dataset.businessCategory !== "All";

    const parts = [];
    if (categoryChosen) parts.push(categoryText);

    summary.textContent = parts.length ? parts.join(" · ") : "All categories";

    badge.textContent = parts.length;
    badge.hidden = parts.length === 0;
  }

  function setFilterPanel(open) {
    sidebar.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", () => {
    setFilterPanel(!sidebar.classList.contains("open"));
  });

  clearButton.addEventListener("click", () => {
    if (originalClear) originalClear.click();
  });

  ["click", "change"].forEach((type) => {
    sidebar.addEventListener(type, () => setTimeout(updateFilterSummary, 0));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 650) setFilterPanel(false);
  });

  updateFilterSummary();
});