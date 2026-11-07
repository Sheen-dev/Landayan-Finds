const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginButton = loginForm.querySelector(".login-button");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginError.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";

  try {
    const response = await fetch("api/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      window.location.href = "index.php";
      return;
    }

    loginError.textContent = result.message || "Login failed.";
  } catch (error) {
    console.error("Login error:", error);
    loginError.textContent =
      "Unable to connect to the server. Please try again.";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});
