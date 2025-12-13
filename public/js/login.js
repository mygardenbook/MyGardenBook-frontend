/* =============================================================
   login.js — FINAL (Supabase Auth: User + Admin)
============================================================= */

const SUPABASE_URL = window.__ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV.SUPABASE_ANON_KEY;

// Supabase client
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------
     ELEMENTS
  ---------------------------- */
  const userTab = document.getElementById("userTab");
  const adminTab = document.getElementById("adminTab");
  const formSlider = document.getElementById("formSlider");

  const uLoginBtn = document.getElementById("uLoginBtn");
  const uSignupBtn = document.getElementById("uSignupBtn");

  const userLoginForm = document.getElementById("userLoginForm");
  const userSignupForm = document.getElementById("userSignupForm");
  const adminLoginForm = document.getElementById("adminLoginForm");

  const userLoginEmail = document.getElementById("userLoginEmail");
  const userLoginPass = document.getElementById("userLoginPass");
  const userLoginMsg = document.getElementById("userLoginMsg");

  const userSignupEmail = document.getElementById("userSignupEmail");
  const userSignupPass = document.getElementById("userSignupPass");
  const userSignupConfirm = document.getElementById("userSignupConfirm");
  const userSignupMsg = document.getElementById("userSignupMsg");

  const adminEmail = document.getElementById("adminEmail");
  const adminPass = document.getElementById("adminPass");
  const adminMsg = document.getElementById("adminMsg");

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

    userLoginMsg.style.color = "#333";
    userLoginMsg.textContent = "Signing in...";

    const email = userLoginEmail.value.trim();
    const password = userLoginPass.value.trim();

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
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
    const password = userSignupPass.value.trim();
    const confirm = userSignupConfirm.value.trim();

    if (password !== confirm) {
      userSignupMsg.style.color = "red";
      userSignupMsg.textContent = "Passwords do not match.";
      return;
    }

    const { error } = await client.auth.signUp({
      email,
      password
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
     ADMIN LOGIN (Supabase + Role Check)
  ---------------------------- */
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    adminMsg.style.color = "#333";
    adminMsg.textContent = "Logging in...";

    const email = adminEmail.value.trim();
    const password = adminPass.value.trim();

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const token = data.session.access_token;

      // Fetch admin profile
      const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        await client.auth.signOut();
        throw new Error("This account is not an admin.");
      }

      // Store admin session
      localStorage.setItem("sb_token", token);
      localStorage.setItem("role", "admin");
      localStorage.setItem("mg_user_id", data.user.id);

      window.location.href = "Admin.html";

    } catch (err) {
      adminMsg.style.color = "red";
      adminMsg.textContent = err.message || "Admin login failed.";
    }
  });

});
