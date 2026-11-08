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

  const avatarButton = document.querySelector(".header-avatar");

  if (avatarButton) {
    avatarButton.classList.toggle("is-active", id === "account");
  }

  window.scrollTo(0, 0);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-page]");

  if (link) {
    showPage(link.dataset.page);
  }

  const tab = event.target.closest("[data-tab]");

  if (tab) {
    document.querySelectorAll(".tab").forEach((item) => {
      item.classList.toggle("active", item === tab);
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === tab.dataset.tab);
    });
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

/* JOB LISTINGS */

// Empty for now. Real jobs will be loaded from the database later.
let jobListings = [];

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

function getSelectedJobTypes() {
  return Array.from(document.querySelectorAll("[data-job-type]:checked")).map(
    (checkbox) => checkbox.value
  );
}

function getFilteredJobs() {
  const searchTerm = jobSearchInput.value.trim().toLowerCase();
  const selectedTypes = getSelectedJobTypes();

  let filteredJobs = jobListings.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm) ||
      job.business.toLowerCase().includes(searchTerm) ||
      job.category.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedJobCategory === "All" ||
      job.category === selectedJobCategory;

    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(job.type);

    return matchesSearch && matchesCategory && matchesType;
  });

  const sortValue = jobSort.value;

  if (sortValue === "newest") {
    filteredJobs.sort(
      (a, b) => new Date(b.posted) - new Date(a.posted)
    );
  } else if (sortValue === "title") {
    filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "business") {
    filteredJobs.sort((a, b) => a.business.localeCompare(b.business));
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

  displayedJobs.forEach((job) => {
    const card = document.createElement("article");
    card.className = "job-card";

    card.innerHTML = `
      <div class="job-card-top">
        <div class="job-business">
          <div class="job-business-icon">${job.business.charAt(0)}</div>
          <div>
            <h3>${job.business}</h3>
            <p>${job.category}</p>
          </div>
        </div>
        <span class="job-status">${job.status}</span>
      </div>

      <h2>${job.title}</h2>

      <p class="job-description">${job.description}</p>

      <div class="job-meta">
        <span>Employment: ${job.type}</span>
        <span>Location: ${job.location}</span>
        <span>Salary: ${job.salary}</span>
      </div>

      <div class="job-card-bottom">
        <span class="job-posted">Posted: ${formatJobDate(job.posted)}</span>
        <button class="job-apply" type="button" data-job-id="${job.id}">
          View Details <span>→</span>
        </button>
      </div>
    `;

    jobResults.appendChild(card);
  });

  renderJobPagination(totalPages);
}

function formatJobDate(dateString) {
  const date = new Date(dateString + "T00:00:00");

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
      button.classList.add("current-page");
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
    jobSort.value = "newest";

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

if (jobResults) {
  jobResults.addEventListener("click", (event) => {
    const button = event.target.closest("[data-job-id]");

    if (!button) return;

    const job = jobListings.find(
      (item) => item.id === Number(button.dataset.jobId)
    );

    if (!job) return;

    document.getElementById("job-detail-category").textContent =
      job.category;

    document.getElementById("job-detail-title").textContent =
      job.title;

    document.getElementById("job-detail-business").textContent =
      job.business;

    document.getElementById("job-detail-status").textContent =
      job.status;

    document.getElementById("job-detail-meta").innerHTML = `
      <span>${job.type}</span>
      <span>${job.location}</span>
      <span>${job.salary}</span>
      <span>Posted: ${formatJobDate(job.posted)}</span>
    `;

    document.getElementById("job-detail-description").textContent =
      job.description;

    const qualifications = document.getElementById(
      "job-detail-qualifications"
    );

    qualifications.innerHTML = "";

    job.qualifications.forEach((qualification) => {
      const item = document.createElement("li");
      item.textContent = qualification;
      qualifications.appendChild(item);
    });

    document.getElementById("job-detail-application").textContent =
      job.application;

    showPage("job-info");
  });
}

renderJobs();

/* ACCOUNT / LOGIN STATE */

async function loadUser() {
  try {
    const response = await fetch("api/me.php");

    if (!response.ok) return null;

    const result = await response.json();

    return result.success ? result.user : null;
  } catch (error) {
    return null;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value ?? "";
  }
}

(async function setupAccount() {
  const user = await loadUser();
  const headerButton = document.querySelector(".header-inner a.btn");

  if (!user) {
    if (location.hash === "#account") {
      window.location.href = "login.html";
    }

    return;
  }

  if (!headerButton) return;

  const initial = user.first_name.charAt(0).toUpperCase();

  headerButton.className = "header-avatar";
  headerButton.textContent = initial;
  headerButton.title = "Account";
  headerButton.removeAttribute("href");
  headerButton.dataset.page = "account";

  headerButton.classList.toggle(
    "is-active",
    document.getElementById("account").classList.contains("active")
  );

  const fullName = user.first_name + " " + user.last_name;

  setText("accFullName", fullName);
  setText("accName", fullName);
  setText("accAge", user.age);
  setText("accGender", user.gender);
  setText("accEmail", user.email);
  setText("accPhone", user.phone_number);
  setText("accAvatar", initial);

  document.getElementById("accAvatar").style.background = "var(--teal)";

  const cvButton = document.getElementById("cvButton");
  const cvStatus = document.getElementById("cvStatus");
  const cvFile = document.getElementById("cvFile");

  if (cvButton && cvStatus && cvFile) {
    const isOwner = user.account_type === "business_owner";
    let hasCv = user.has_cv;

    function updateResumeBox() {
      if (isOwner) {
        cvButton.textContent = "Download CV";
        cvStatus.textContent = "";
      } else if (hasCv) {
        cvButton.textContent = "Update CV";
        cvStatus.textContent = "Your CV is uploaded.";
      } else {
        cvButton.textContent = "Add CV";
        cvStatus.textContent = "You have not uploaded a CV yet.";
      }

      cvStatus.style.color = "";
    }

    updateResumeBox();

    cvButton.addEventListener("click", () => {
      if (isOwner) return;

      cvFile.click();
    });

    cvFile.addEventListener("change", async () => {
      const file = cvFile.files[0];

      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        cvStatus.textContent = "The file is too big. Maximum is 5 MB.";
        cvStatus.style.color = "#c0392b";
        cvFile.value = "";
        return;
      }

      const formData = new FormData();
      formData.append("cv", file);

      cvButton.disabled = true;
      cvStatus.style.color = "";
      cvStatus.textContent = "Uploading...";

      try {
        const response = await fetch("api/upload_cv.php", {
          method: "POST",
          body: formData
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Upload failed.");
        }

        hasCv = true;
        updateResumeBox();
        cvStatus.textContent = result.message;
      } catch (error) {
        cvStatus.textContent =
          error.message || "Unable to connect to the server.";

        cvStatus.style.color = "#c0392b";
      } finally {
        cvButton.disabled = false;
        cvFile.value = "";
      }
    });
  }

  const logoutLink = document.getElementById("logoutLink");

  if (logoutLink) {
    logoutLink.addEventListener("click", async () => {
      try {
        await fetch("api/logout.php", {
          method: "POST"
        });
      } catch (error) {
        console.error(error);
      }

      window.location.href = "index.html";
    });
  }
})();