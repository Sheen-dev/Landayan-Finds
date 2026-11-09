
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

/* JOB LISTINGS */

let jobListings = [];
let jobsLoadFailed = false;

const jobResults = document.getElementById("job-results");
const jobSearchInput = document.getElementById("job-search-input");
const jobSearchButton = document.getElementById("job-search-button");
const jobResultsCount = document.getElementById("job-results-count");
const jobResultsLabel = document.getElementById("job-results-label");
const jobsEmpty = document.getElementById("jobs-empty");
const jobsPagination = document.getElementById("jobs-pagination");
const jobSort = document.getElementById("job-sort");
const clearJobFilters = document.getElementById("clear-job-filters");

let selectedJobCategory = "All";
let currentJobPage = 1;
const jobsPerPage = 4;

async function loadJobs() {
  jobResultsLabel.textContent = "Loading jobs...";

  try {
    const response = await fetch("api/jobs.php");
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to load jobs.");
    }

    jobListings = result.jobs;
    jobsLoadFailed = false;
  } catch (error) {
    console.error(error);
    jobListings = [];
    jobsLoadFailed = true;
  }

  renderJobs();
}

function getSelectedJobTypes() {
  return Array.from(document.querySelectorAll("[data-job-type]:checked")).map(
    (checkbox) => checkbox.value
  );
}

function getFilteredJobs() {
  const searchTerm = jobSearchInput.value.trim().toLowerCase();
  const selectedTypes = getSelectedJobTypes();

  const filteredJobs = jobListings.filter((job) => {
    const matchesSearch = [
      job.title,
      job.business,
      job.category,
      job.description
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm);

    const matchesCategory =
      selectedJobCategory === "All" ||
      job.category === selectedJobCategory;

    const matchesType =
      selectedTypes.length === 0 ||
      (job.types || []).some((type) => selectedTypes.includes(type));

    return matchesSearch && matchesCategory && matchesType;
  });

  const sortValue = jobSort.value;

  if (sortValue === "title") {
    filteredJobs.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  } else if (sortValue === "business") {
    filteredJobs.sort((a, b) =>
      String(a.business).localeCompare(String(b.business))
    );
  }

  return filteredJobs;
}

function renderJobs() {
  const filteredJobs = getFilteredJobs();
  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  if (currentJobPage > totalPages && totalPages > 0) {
    currentJobPage = totalPages;
  }

  if (totalPages === 0) {
    currentJobPage = 1;
  }

  const startIndex = (currentJobPage - 1) * jobsPerPage;
  const displayedJobs = filteredJobs.slice(
    startIndex,
    startIndex + jobsPerPage
  );

  jobResults.innerHTML = "";

  jobResultsCount.textContent =
    `${totalJobs} ${totalJobs === 1 ? "job" : "jobs"} available`;

  jobResultsLabel.textContent =
    totalJobs > 0
      ? `Showing ${startIndex + 1}-${Math.min(
          startIndex + jobsPerPage,
          totalJobs
        )} of ${totalJobs} positions`
      : "No positions found";

  jobsEmpty.hidden = totalJobs !== 0;

  if (jobsLoadFailed) {
    jobsEmpty.textContent =
      "We could not load the jobs. Please try again later.";
  } else if (jobListings.length === 0) {
    jobsEmpty.textContent = "No jobs are currently available.";
  } else {
    jobsEmpty.textContent = "No jobs match your search.";
  }

  displayedJobs.forEach((job) => {
    const card = document.createElement("article");
    card.className = "job-card";

    const tags = (job.types || [])
      .map((type) => `<span class="job-tag">${escapeHtml(type)}</span>`)
      .join("");

    const style = categoryStyle(job.category);

    card.innerHTML = `
      <div class="job-card-icon">
        ${imageOrPlaceholder(
          job.profile,
          job.category,
          style.icon,
          job.business
        )}
      </div>

      <div class="job-card-content">
        <h3>${escapeHtml(job.title)}</h3>
        <p class="job-card-business">${escapeHtml(job.business)} · ${escapeHtml(job.category)}</p>

        <div class="job-card-meta">
          <span>Schedule: ${escapeHtml(job.schedule)}</span>
          <span>Salary: ${escapeHtml(job.salary)}</span>
          <span>Posted: ${escapeHtml(formatJobDate(job.posted))}</span>
        </div>

        <div class="job-card-tags">${tags}</div>
      </div>

      <div class="job-card-action">
        <button type="button" data-job-id="${escapeHtml(job.id)}">
          View Details →
        </button>
      </div>
    `;

    jobResults.appendChild(card);
  });

  renderJobPagination(totalPages);
}

function formatJobDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function renderJobPagination(totalPages) {
  jobsPagination.innerHTML = "";

  if (totalPages <= 1) return;

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.textContent = "Previous";
  previousButton.disabled = currentJobPage === 1;

  previousButton.addEventListener("click", () => {
    if (currentJobPage > 1) {
      currentJobPage--;
      renderJobs();
    }
  });

  jobsPagination.appendChild(previousButton);

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = page;

    if (page === currentJobPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      currentJobPage = page;
      renderJobs();
    });

    jobsPagination.appendChild(button);
  }

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.textContent = "Next";
  nextButton.disabled = currentJobPage === totalPages;

  nextButton.addEventListener("click", () => {
    if (currentJobPage < totalPages) {
      currentJobPage++;
      renderJobs();
    }
  });

  jobsPagination.appendChild(nextButton);
}

function resetJobPage() {
  currentJobPage = 1;
  renderJobs();
}

if (jobSearchInput) {
  jobSearchInput.addEventListener("input", resetJobPage);
}

if (jobSearchButton) {
  jobSearchButton.addEventListener("click", resetJobPage);
}

if (jobSort) {
  jobSort.addEventListener("change", resetJobPage);
}

document.querySelectorAll("[data-job-category]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-job-category]").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    selectedJobCategory = button.dataset.jobCategory;

    resetJobPage();
  });
});

document.querySelectorAll("[data-job-type]").forEach((checkbox) => {
  checkbox.addEventListener("change", resetJobPage);
});

if (clearJobFilters) {
  clearJobFilters.addEventListener("click", () => {
    jobSearchInput.value = "";
    jobSort.value = "title";

    selectedJobCategory = "All";

    document.querySelectorAll("[data-job-category]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.jobCategory === "All"
      );
    });

    document.querySelectorAll("[data-job-type]").forEach((checkbox) => {
      checkbox.checked = false;
    });

    resetJobPage();
  });
}

/* JOB DETAILS */

function fillJobList(id, lines) {
  const element = document.getElementById(id);

  if (!element) return;

  const items = (lines || []).filter(Boolean);

  if (element.tagName === "UL" || element.tagName === "OL") {
    element.innerHTML = "";

    items.forEach((line) => {
      const item = document.createElement("li");
      item.textContent = line;
      element.appendChild(item);
    });
  } else {
    element.textContent = items.join(" ");
  }

  const section = element.closest(".job-detail-section");

  if (section) {
    section.hidden = items.length === 0;
  }
}

function showJobDetails(job) {
  document.getElementById("job-detail-category").textContent = job.category;
  document.getElementById("job-detail-title").textContent = job.title;
  document.getElementById("job-detail-business").textContent = job.business;
  document.getElementById("job-detail-status").textContent = job.status;

  document.getElementById("job-detail-meta").innerHTML = `
    <span>${escapeHtml(job.type)}</span>
    <span>${escapeHtml(job.schedule)}</span>
    <span>${escapeHtml(job.salary)}</span>
    <span>${escapeHtml(job.location)}</span>
    <span>Posted: ${escapeHtml(formatJobDate(job.posted))}</span>
  `;

  document.getElementById("job-detail-description").textContent =
    job.description || "";

  fillJobList("job-detail-responsibilities", job.responsibilities);
  fillJobList("job-detail-requirements", job.requirements);
  fillJobList("job-detail-qualifications", job.qualifications);
  fillJobList("job-detail-application", job.application);

  const mapBox = document.getElementById("job-detail-map");
  const mapSection = document.getElementById("job-detail-map-section");

  if (mapBox) {
    mapBox.innerHTML = "";

    if (
      job.mapSrc &&
      job.mapSrc.startsWith("https://www.google.com/maps")
    ) {
      const frame = document.createElement("iframe");

      frame.src = job.mapSrc;
      frame.title = `Map of ${job.business}`;
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer-when-downgrade";

      mapBox.appendChild(frame);

      if (mapSection) mapSection.hidden = false;
    } else if (mapSection) {
      mapSection.hidden = true;
    }
  }

  showPage("job-info");
}

if (jobResults) {
  jobResults.addEventListener("click", (event) => {
    const button = event.target.closest("[data-job-id]");

    if (!button) return;

    const job = jobListings.find(
      (item) => String(item.id) === button.dataset.jobId
    );

    if (job) {
      showJobDetails(job);
    }
  });
}

loadJobs();

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

function safeImagePath(path) {
  return typeof path === "string" &&
    /^uploads\/[\w\-./]+$/.test(path) &&
    !path.includes("..")
    ? path
    : "";
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

function getOpenStatus(business) {
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

function getFilteredBusinesses() {
  const searchTerm = businessSearchInput.value.trim().toLowerCase();

  const filtered = businessListings.filter((business) => {
    const itemText = (business.products || [])
      .map((item) => `${item.name} ${item.description || ""}`)
      .join(" ");

    const matchesSearch = [
      business.name,
      business.category,
      business.info,
      itemText
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm);

    const matchesCategory =
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
        <p class="job-card-business">${escapeHtml(business.category)}</p>

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

if (businessSearchInput) {
  businessSearchInput.addEventListener("input", resetBusinessPage);
}

if (businessSearchButton) {
  businessSearchButton.addEventListener("click", resetBusinessPage);
}

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

    resetBusinessPage();
  });
});

if (clearBusinessFilters) {
  clearBusinessFilters.addEventListener("click", () => {
    businessSearchInput.value = "";
    businessSort.value = "name";

    selectedBusinessCategory = "All";

    document
      .querySelectorAll("[data-business-category]")
      .forEach((button) => {
        button.classList.toggle(
          "active",
          button.dataset.businessCategory === "All"
        );
      });

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
    status.textContent = openNow ? "Open now" : "Closed now";
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

/* FILTER PANELS */

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
      activeCategory.dataset.jobCategory !== "All" &&
      activeCategory.dataset.businessCategory !== "All";

    const types = Array.from(
      sidebar.querySelectorAll("[data-job-type]:checked")
    ).map((input) => input.value);

    const parts = [];
    if (categoryChosen) parts.push(categoryText);
    parts.push(...types);

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
