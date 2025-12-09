const SUPABASE_URL = window.__ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV.SUPABASE_ANON_KEY;
const API_BASE = window.__ENV.API_BASE;

// Supabase client
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------
     ELEMENTS
  ---------------------------- */
  const userTab = document.getElementById('userTab');
  const adminTab = document.getElementById('adminTab');
  const formSlider = document.getElementById('formSlider');

  const uLoginBtn = document.getElementById('uLoginBtn');
  const uSignupBtn = document.getElementById('uSignupBtn');

  const userLoginForm = document.getElementById('userLoginForm');
  const userSignupForm = document.getElementById('userSignupForm');
  const adminLoginForm = document.getElementById('adminLoginForm');

  const userLoginEmail = document.getElementById('userLoginEmail');
  const userLoginPass = document.getElementById('userLoginPass');
  const userLoginMsg = document.getElementById('userLoginMsg');

  const userSignupEmail = document.getElementById('userSignupEmail');
  const userSignupPass = document.getElementById('userSignupPass');
  const userSignupConfirm = document.getElementById('userSignupConfirm');
  const userSignupMsg = document.getElementById('userSignupMsg');

  const adminEmail = document.getElementById('adminEmail');
  const adminPass = document.getElementById('adminPass');
  const adminMsg = document.getElementById('adminMsg');


  /* ---------------------------
     TAB SWITCHING
  ---------------------------- */
  userTab.onclick = () => {
    formSlider.style.transform = "translateX(0%)";
    userTab.classList.add("active");
    adminTab.classList.remove("active");
  };

  adminTab.onclick = () => {
    formSlider.style.transform = "translateX(-50%)";
    adminTab.classList.add("active");
    userTab.classList.remove("active");
  };

  /* User login/signup toggle */
  uLoginBtn.onclick = () => {
    uLoginBtn.classList.add("active");
    uSignupBtn.classList.remove("active");
    userLoginForm.style.display = "flex";
    userSignupForm.style.display = "none";
  };

  uSignupBtn.onclick = () => {
    uSignupBtn.classList.add("active");
    uLoginBtn.classList.remove("active");
    userSignupForm.style.display = "flex";
    userLoginForm.style.display = "none";
  };


  /* ---------------------------
     USER LOGIN
  ---------------------------- */
  userLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    userLoginMsg.textContent = "Signing in...";

    const email = userLoginEmail.value.trim();
    const pass = userLoginPass.value.trim();

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) {
      userLoginMsg.style.color = "red";
      userLoginMsg.textContent = error.message;
      return;
    }

    localStorage.setItem("role", "user");
    localStorage.setItem("mg_user_id", data.user.id);

    window.location.href = "User.html";
  });


  /* ---------------------------
     USER SIGNUP
  ---------------------------- */
  userSignupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = userSignupEmail.value.trim();
    const pass = userSignupPass.value.trim();
    const confirm = userSignupConfirm.value.trim();

    if (pass !== confirm) {
      userSignupMsg.style.color = "red";
      userSignupMsg.textContent = "Passwords do not match.";
      return;
    }

    const { error } = await client.auth.signUp({
      email,
      password: pass
    });

    if (error) {
      userSignupMsg.style.color = "red";
      userSignupMsg.textContent = error.message;
      return;
    }

    userSignupMsg.style.color = "green";
    userSignupMsg.textContent = "Account created. Please login.";
    uLoginBtn.click();
  });


  /* ---------------------------
     ADMIN LOGIN
  ---------------------------- */
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    adminMsg.textContent = "Logging in...";

    const email = adminEmail.value.trim();
    const password = adminPass.value.trim();

    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      adminMsg.style.color = "red";
      adminMsg.textContent = json.error || "Invalid login.";
      return;
    }

    localStorage.setItem("role", "admin");
    localStorage.setItem("admin_token", json.token);

    window.location.href = "Admin.html";
  });

});
