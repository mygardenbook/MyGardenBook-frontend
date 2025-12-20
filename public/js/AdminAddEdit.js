/* =============================================================
   AdminAddEdit.js — FINAL, VERIFIED, QR-IMMEDIATE
============================================================= */
document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ AdminAddEdit.js LOADED");

  /* 🔧 Prevent /undefined */
  const API_BASE = window.__ENV?.API_BASE || "";

  /* ---------------- PAGE CONTEXT ---------------- */
  const page = window.location.pathname.toLowerCase();
  const isPlantPage = page.includes("plant");
  const endpoint = isPlantPage ? "plants" : "fishes";
  const redirectPage = isPlantPage ? "AdminPlants.html" : "AdminFishes.html";

  /* ---------------- DOM ---------------- */
  const sciName = document.getElementById("sciName");
  const commonName = document.getElementById("commonName");
  const categorySelect = document.getElementById("category");
  const description = document.getElementById("description");
  const imageUpload = document.getElementById("imageUpload");

  const newCategoryWrapper = document.getElementById("newCategoryWrapper");
  const newCategoryInput = document.getElementById("newCategoryInput");

  const qrSection = document.getElementById("qrSection");
  const qrImage = document.getElementById("qrImage");
  const qrLink = document.getElementById("qrLink");
  const statusMsg = document.getElementById("statusMsg");

  /* ---------------- AUTH ---------------- */
  function getAdminToken() {
    const token = localStorage.getItem("sb_token");
    if (!token) {
      alert("Admin session expired. Please login again.");
      location.href = "Login.html";
      throw new Error("Missing admin token");
    }
    return token;
  }

  function authHeaders() {
    return { Authorization: `Bearer ${getAdminToken()}` };
  }

  /* ---------------- URL PARAMS ---------------- */
  const params = new URLSearchParams(window.location.search);
  let itemId = params.get("id");
  let currentItem = null;

  // ✅ KEY FIX: explicitly track first save
  let isFirstSave = !itemId;

  /* ---------------- STATUS ---------------- */
  function showMessage(msg, type = "success") {
    if (!statusMsg) return;
    statusMsg.style.display = "block";
    statusMsg.style.color = type === "error" ? "#b22222" : "#2d6a1c";
    statusMsg.textContent = msg;
  }

  /* ---------------- LOAD CATEGORIES ---------------- */
  async function loadCategories(selected = "") {
    const res = await fetch(`${API_BASE}/api/categories`);
    const categories = await res.json();

    categorySelect.innerHTML = `
      <option value="">-- Select Category --</option>
      ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("")}
      <option value="__new__">+ Add New Category</option>
    `;

    if (selected) categorySelect.value = selected;

    // ✅ force repaint (does NOT change UI)
    categorySelect.style.display = "block";
  }

  /* ---------------- CATEGORY CHANGE ---------------- */
  categorySelect.addEventListener("change", () => {
    if (categorySelect.value === "__new__") {
      categorySelect.value = "";
      newCategoryWrapper.style.display = "flex";
      newCategoryInput.value = "";
      newCategoryInput.focus();
    } else {
      newCategoryWrapper.style.display = "none";
    }
  });

  /* ---------------- CREATE CATEGORY ---------------- */
  async function saveNewCategory() {
    const name = newCategoryInput.value.trim();
    if (!name) return showMessage("Category name required", "error");

    const res = await fetch(`${API_BASE}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({ name })
    });

    if (!res.ok) return showMessage("Category already exists", "error");

    await loadCategories(name);
    newCategoryInput.value = "";
    newCategoryWrapper.style.display = "none";
    showMessage("Category created");
  }
  window.saveNewCategory = saveNewCategory;

  /* ---------------- LOAD ITEM ---------------- */
  async function loadItem() {
    await loadCategories();

    if (!itemId) return;

    const res = await fetch(`${API_BASE}/api/${endpoint}/${itemId}`);
    currentItem = await res.json();

    sciName.value = currentItem.scientific_name || "";
    commonName.value = currentItem.name || "";
    description.value = currentItem.description || "";
    await loadCategories(currentItem.category);

    if (currentItem.qr_code_url) {
      qrImage.src = currentItem.qr_code_url;
      qrLink.textContent = "View Item";
      qrLink.href = `${isPlantPage ? "PlantView.html" : "FishView.html"}?id=${itemId}`;
      qrSection.style.display = "block";
    }
  }

  /* ---------------- SAVE ---------------- */
  async function saveForm() {
    const formData = new FormData();
    formData.append("name", commonName.value.trim());
    formData.append("scientific_name", sciName.value.trim());
    if (categorySelect.value)
      formData.append("category", categorySelect.value);
    formData.append("description", description.value.trim());

    if (imageUpload.files.length) {
      formData.append("image", imageUpload.files[0]);
    }

    const res = await fetch(
      itemId
        ? `${API_BASE}/api/${endpoint}/${itemId}`
        : `${API_BASE}/api/${endpoint}`,
      {
        method: itemId ? "PUT" : "POST",
        headers: authHeaders(),
        body: formData
      }
    );

    const data = await res.json();
    if (!res.ok) return showMessage("Save failed", "error");

    const saved = data.plant || data.fish;
    if (!saved) {
      console.error("Unexpected save response:", data);
      return showMessage("Save succeeded but response invalid", "error");
    }

    /* ---------- FIRST SAVE: SHOW QR IMMEDIATELY ---------- */
    if (isFirstSave) {
  itemId = saved.id;
  isFirstSave = false;

  // ✅ USE QR FROM SAVE RESPONSE (FAST PATH)
  if (saved.qr_code_url) {
    currentItem = saved;
    qrImage.src = saved.qr_code_url;
    qrLink.textContent = "View Item";
    qrLink.href = `${isPlantPage ? "PlantView.html" : "FishView.html"}?id=${itemId}`;
    qrSection.style.display = "block";
    showMessage("Saved successfully.");
    return;
  }

  // 🔁 FALLBACK: poll only if QR wasn't ready
  let attempts = 0;

  const pollForQR = async () => {
    attempts++;

    const qrRes = await fetch(`${API_BASE}/api/${endpoint}/${itemId}`);
    currentItem = await qrRes.json();

    if (currentItem.qr_code_url) {
      qrImage.src = currentItem.qr_code_url;
      qrLink.textContent = "View Item";
      qrLink.href = `${isPlantPage ? "PlantView.html" : "FishView.html"}?id=${itemId}`;
      qrSection.style.display = "block";
      showMessage("Saved successfully.");
      return;
    }

    if (attempts < 8) {
      setTimeout(pollForQR, 700);
    } else {
      showMessage("QR is still processing. Please wait a bit.", "error");
    }
  };

  pollForQR();
  return;
}


    /* ---------- SECOND SAVE: REDIRECT ---------- */
    location.href = redirectPage;
  }

  /* ---------------- CLEAR ---------------- */
  function clearForm() {
    sciName.value = "";
    commonName.value = "";
    description.value = "";
    categorySelect.value = "";
    imageUpload.value = "";
    qrSection.style.display = "none";
    statusMsg.style.display = "none";
  }

  /* ---------------- QR DOWNLOAD ---------------- */
  function downloadQR() {
    if (!currentItem?.qr_code_url) {
      alert("QR not available");
      return;
    }

    const a = document.createElement("a");
    a.href = currentItem.qr_code_url;
    a.download = `${currentItem.name || "qr-code"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* ---------------- INIT ---------------- */
  loadItem();
  window.saveForm = saveForm;
  window.clearForm = clearForm;
  window.downloadQR = downloadQR;
});
