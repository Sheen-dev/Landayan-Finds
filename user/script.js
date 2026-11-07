// Show one page (section) at a time, like tabs.
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("[data-nav]");

function showPage(id) {
  pages.forEach((p) => p.classList.toggle("active", p.id === id));

  // Underline the active nav link (detail pages keep their parent underlined)
  const parent = document.getElementById(id).dataset.parent || id;
  navLinks.forEach((a) =>
    a.classList.toggle("active", a.dataset.page === parent),
  );

  // Header circle gets a lighter outline while the Account page is open
  const avatarButton = document.querySelector(".header-avatar");
  if (avatarButton)
    avatarButton.classList.toggle("is-active", id === "account");

  window.scrollTo(0, 0);
}

// Any element with data-page switches the page when clicked
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-page]");
  if (link) showPage(link.dataset.page);

  // Account inner tabs (Information / Applications)
  const tab = e.target.closest("[data-tab]");
  if (tab) {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.toggle("active", t === tab));
    document
      .querySelectorAll(".tab-panel")
      .forEach((p) => p.classList.toggle("active", p.id === tab.dataset.tab));
  }
});

// Category list: click to select
document.addEventListener("click", (e) => {
  const cat = e.target.closest(".cat");
  if (!cat) return;
  cat.parentElement
    .querySelectorAll(".cat")
    .forEach((c) => c.classList.toggle("active", c === cat));
});

// Open the page named in the link, e.g. index.html#jobs
const start = location.hash.slice(1);
showPage(document.getElementById(start) ? start : "home");

// ================= ACCOUNT / LOGIN STATE =================
// Ask the server who is logged in (api/me.php)
async function loadUser() {
  try {
    const response = await fetch("api/me.php");
    if (!response.ok) return null;
    const result = await response.json();
    return result.success ? result.user : null;
  } catch (error) {
    return null; // server not running
  }
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

(async function setupAccount() {
  const user = await loadUser();
  const headerButton = document.querySelector(".header-inner a.btn");

  // Not logged in: the Account page needs a login
  if (!user) {
    if (location.hash === "#account") window.location.href = "login.html";
    return;
  }

  // Logged in: the Login button becomes a circle with your first letter
  const initial = user.first_name.charAt(0).toUpperCase();
  headerButton.className = "header-avatar";
  headerButton.textContent = initial;
  headerButton.title = "Account";
  headerButton.removeAttribute("href");
  headerButton.dataset.page = "account";
  headerButton.classList.toggle(
    "is-active",
    document.getElementById("account").classList.contains("active"),
  );

  // Fill the Account page
  const fullName = user.first_name + " " + user.last_name;
  setText("accFullName", fullName);
  setText("accName", fullName);
  setText("accAge", user.age);
  setText("accGender", user.gender);
  setText("accEmail", user.email);
  setText("accPhone", user.phone_number);
  setText("accAvatar", initial);
  document.getElementById("accAvatar").style.background = "var(--teal)";

  // ----- Resume box: the button depends on who you are -----
  const cvButton = document.getElementById("cvButton");
  const cvStatus = document.getElementById("cvStatus");
  const cvFile = document.getElementById("cvFile");
  const isOwner = user.account_type === "business_owner";
  let hasCv = user.has_cv;

  function updateResumeBox() {
    if (isOwner) {
      cvButton.textContent = "Download CV"; // business owner
      cvStatus.textContent = "";
    } else if (hasCv) {
      cvButton.textContent = "Update CV"; // job seeker with a CV
      cvStatus.textContent = "Your CV is uploaded.";
    } else {
      cvButton.textContent = "Add CV"; // job seeker without a CV
      cvStatus.textContent = "You have not uploaded a CV yet.";
    }
    cvStatus.style.color = "";
  }
  updateResumeBox();

  cvButton.addEventListener("click", function () {
    if (isOwner) return; // Download CV will be connected to the applicants later
    cvFile.click(); // open the file picker
  });

  cvFile.addEventListener("change", async function () {
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
        body: formData,
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

  // Log out
  document
    .getElementById("logoutLink")
    .addEventListener("click", async function () {
      await fetch("api/logout.php");
      window.location.href = "index.html";
    });
})();
