/* =============================================================
   AdminAddEdit.js — FINAL (STABLE)
============================================================= */
document.addEventListener("DOMContentLoaded", () => {

console.log("✅ AdminAddEdit.js LOADED");

const API_BASE = window.__ENV.API_BASE;

/* ---------------- PAGE CONTEXT ---------------- */
const page = window.location.pathname.toLowerCase();
const isPlantPage = page.includes("plant");
const type = isPlantPage ? "plant" : "fish";
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
    window.location.href = "Login.html";
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

/* ---------------- STATUS ---------------- */
function showMessage(msg, type = "success") {
  if (!statusMsg) return;
  statusMsg.style.display = "block";
  statusMsg.style.color = type === "error" ? "#b22222" : "#2d6a1c";
  statusMsg.textContent = msg;
}

/* ---------------- LOAD CATEGORIES ---------------- */
async function loadCategories(selected = "") {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    const categories = await res.json();

    categorySelect.innerHTML = `
      <option value="">-- Select Category --</option>
      ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("")}
      <option value="__new__">+ Add New Category</option>
    `;

    if (selected) categorySelect.value = selected;

  } catch (err) {
    console.error(err);
    showMessage("Failed to load categories", "error");
  }
}

/* ---------------- CATEGORY CHANGE ---------------- */
categorySelect.addEventListener("change", () => {
  if (categorySelect.value === "__new__") {
    newCategoryWrapper.style.display = "block";
    newCategoryInput.focus();
  } else {
    newCategoryWrapper.style.display = "none";
  }
});

/* ---------------- CREATE CATEGORY ---------------- */
async function saveNewCategory() {
  const name = newCategoryInput.value.trim();
  if (!name) {
    showMessage("Category name required", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({ name }) // ❌ NO type column
    });

    if (!res.ok) throw new Error();

    await loadCategories(name);
    newCategoryWrapper.style.display = "none";
    newCategoryInput.value = "";
    showMessage("Category created");

  } catch {
    showMessage("Category already exists", "error");
  }
}

window.saveNewCategory = saveNewCategory;

/* ---------------- LOAD ITEM ---------------- */
async function loadItem() {
  await loadCategories();

  if (!itemId) return;

  const res = await fetch(`${API_BASE}/api/${endpoint}/${itemId}`);
  const item = await res.json();
  currentItem = item;

  sciName.value = item.scientific_name || "";
  commonName.value = item.name || "";
  description.value = item.description || "";

  await loadCategories(item.category);

  if (item.qr_code_url) {
    qrImage.src = item.qr_code_url;
    qrLink.href = `${isPlantPage ? "PlantView.html" : "FishView.html"}?id=${item.id}`;
    qrLink.textContent = `View ${type}`;
    qrSection.style.display = "block";
  }
}

/* ---------------- SAVE ---------------- */
async function saveForm() {
  const formData = new FormData();

  formData.append("name", commonName.value.trim());
  formData.append("scientific_name", sciName.value.trim());
  formData.append("category", categorySelect.value);
  formData.append("description", description.value.trim());

  if (imageUpload.files.length) {
    formData.append("image", imageUpload.files[0]);
  }

  const url = itemId
    ? `${API_BASE}/api/${endpoint}/${itemId}`
    : `${API_BASE}/api/${endpoint}`;

  const method = itemId ? "PUT" : "POST";

  showMessage("Saving...");

  const res = await fetch(url, {
    method,
    headers: authHeaders(),
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    showMessage(data.error || "Save failed", "error");
    return;
  }

  if (!itemId) {
    itemId = data.id;
    qrImage.src = data.qr_code_url;
    qrSection.style.display = "block";
    showMessage("QR generated. Save again to finish.");
    return;
  }

  window.location.href = redirectPage;
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

/* ---------------- QR ---------------- */
function downloadQR() {
  if (!currentItem) return;
  const a = document.createElement("a");
  a.href = currentItem.qr_code_url;
  a.download = `${currentItem.name}_QR.png`;
  a.click();
}

/* ---------------- INIT ---------------- */
loadItem();
window.saveForm = saveForm;
window.clearForm = clearForm;
window.downloadQR = downloadQR;

});
