// BUSINESS DATA
// Database integration will be connected in the next steps.
const businesses = [];

// ELEMENTS
const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".content-section");

const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");

const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

// TAB NAVIGATION
navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navButtons.forEach((btn) => btn.classList.remove("active"));
    sections.forEach((section) => section.classList.remove("active"));

    button.classList.add("active");

    const selectedTab = document.getElementById(button.dataset.tab);

    if (selectedTab) {
      selectedTab.classList.add("active");
    }

    const isApprovals = button.dataset.tab === "approvals";

    pageTitle.textContent = isApprovals
      ? "Business Approvals"
      : "All Businesses";

    pageSubtitle.textContent = isApprovals
      ? "Review and manage business applications."
      : "View, search, and manage all approved businesses.";

    renderAll();
  });
});

// DASHBOARD STATISTICS
function updateStats() {
  const pending = businesses.filter(
    (business) => business.status === "pending",
  ).length;

  const approved = businesses.filter(
    (business) => business.status === "approved",
  ).length;

  document.getElementById("total-stat").textContent = approved;
  document.getElementById("pending-stat").textContent = pending;
  document.getElementById("pending-count").textContent = pending;

  document.getElementById("approval-label").textContent = `${pending} Pending`;
}

// BUSINESS APPROVALS
function renderApprovals() {
  const container = document.getElementById("approval-list");

  const pendingBusinesses = businesses.filter(
    (business) => business.status === "pending",
  );

  if (pendingBusinesses.length === 0) {
    container.innerHTML = `
            <div class="empty">
                <strong>No pending applications</strong>
                <p>New business applications will appear here.</p>
            </div>
        `;
    return;
  }
}

// ALL APPROVED BUSINESSES
function renderBusinesses() {
  const tbody = document.getElementById("business-table");

  const search = searchInput ? searchInput.value.toLowerCase() : "";

  const category = categoryFilter ? categoryFilter.value : "all";

  const approvedBusinesses = businesses.filter(
    (business) => business.status === "approved",
  );

  const filtered = approvedBusinesses.filter((business) => {
    const matchesName = business.name.toLowerCase().includes(search);

    const matchesCategory =
      category === "all" || business.category === category;

    return matchesName && matchesCategory;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    No approved businesses found.
                </td>
            </tr>
        `;
  }

  document.getElementById("table-count").textContent =
    `Showing ${filtered.length} of ${approvedBusinesses.length} businesses`;
}

// SEARCH AND CATEGORY FILTER
if (searchInput) {
  searchInput.addEventListener("input", renderBusinesses);
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", renderBusinesses);
}

// LOGOUT
const logoutButton = document.getElementById("logout-btn");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to log out?");

    if (!confirmLogout) return;

    window.location.href = "api/logout.php";
  });
}

// RENDER DASHBOARD
function renderAll() {
  updateStats();
  renderApprovals();
  renderBusinesses();
}

renderAll();
