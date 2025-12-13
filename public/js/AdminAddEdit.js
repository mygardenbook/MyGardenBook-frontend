/* =============================================================
   AdminAddEdit.js — FINAL (Supabase Categories)
============================================================= */

const API_BASE = window.__ENV.API_BASE;

// Detect page type
const page = window.location.pathname.toLowerCase();
const isPlantPage = page.includes("plant");
const isFishPage = page.includes("fish");

const type = isPlantPage ? "plant" : "fish";
const endpoint = isPlantPage ? "plants" : "fish";
const redirectPage = isPlantPage ? "AdminPlants.html" : "AdminFishes.html";

// DOM
const sciName = document.getElementById("sciName");
const commonName = document.getElementById("commonName");
const categorySelect = document.getElementById("category");
const description = document.getElementById("description");
const imageUpload = document.getElementById("imageUpload");

const qrSection = document.getElementById("qrSection");
const qrImage = document.getElementById("qrImage");
const qrLink = document.getElementById("qrLink");
const statusMsg = document.getElementById("statusMsg");

// URL params
const params = new URLSearchParams(window.location.search);
let itemId = params.get("id");
let currentItem = null;

/* ---------------- STATUS ---------------- */
function showMessage(msg, type = "success") {
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
      <option value="__new__">+ Create New Category</option>
    `;

    if (selected) categorySelect.value = selected;

  } catch (err) {
    console.error("Category load failed:", err);
    showMessage("Failed to load categories", "error");
  }
}

/* ---------------- CREATE CATEGORY ---------------- */
async function createCategory(name) {
  const res = await fetch(`${API_BASE}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  if (!res.ok) throw new Error("Category creation failed");
}

/* ---------------- CATEGORY CHANGE ---------------- */
categorySelect.addEventListener("change", async () => {
  if (categorySelect.value === "__new__") {
    const name = prompt("Enter new category name:");
    if (!name || !name.trim()) {
      categorySelect.value = "";
      return;
    }

    try {
      await createCategory(name.trim());
      await loadCategories(name.trim());
      showMessage("Category created");
    } catch {
      showMessage("Category already exists", "error");
      categorySelect.value = "";
    }
  }
});

/* ---------------- LOAD ITEM ---------------- */
async function loadItem() {
  await loadCategories();

  if (!itemId) return;

  try {
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
  } catch (err) {
    console.error(err);
    showMessage("Failed to load item", "error");
  }
}

/* ---------------- SAVE ---------------- */
async function saveForm() {
  const formData = new FormData();

  formData.append("name", commonName.value.trim());
  formData.append("scientific_name", sciName.value.trim());
  formData.append("category", categorySelect.value);
  formData.append("description", description.value.trim());
  formData.append("type", type);

  if (imageUpload.files.length) {
    formData.append("image", imageUpload.files[0]);
  }

  const url = itemId
  ? `${API_BASE}/api/fish/edit/${itemId}`
  : `${API_BASE}/api/fish`;

  showMessage("Saving...");

  try {
    const res = await fetch(url, { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showMessage("Save failed", "error");
      return;
    }

    if (!itemId) {
      currentItem = data.item;
      itemId = currentItem.id;

      qrImage.src = currentItem.qr_code_url;
      qrLink.href = `${isPlantPage ? "PlantView.html" : "FishView.html"}?id=${itemId}`;
      qrLink.textContent = `View ${type}`;
      qrSection.style.display = "block";

      showMessage("QR generated. Save again to finish.");
      return;
    }

    window.location.href = redirectPage;

  } catch (err) {
    console.error(err);
    showMessage("Server error", "error");
  }
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
