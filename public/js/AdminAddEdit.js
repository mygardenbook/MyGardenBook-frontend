document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = window.__ENV.API_BASE;
  const isPlant = location.pathname.includes("Plant");
  const endpoint = isPlant ? "plants" : "fishes";
  const redirect = isPlant ? "AdminPlants.html" : "AdminFishes.html";

  const commonName = document.getElementById("commonName");
  const category = document.getElementById("category");
  const description = document.getElementById("description");
  const imageUpload = document.getElementById("imageUpload");
  const qrSection = document.getElementById("qrSection");
  const qrImage = document.getElementById("qrImage");
  const qrLink = document.getElementById("qrLink");

  const id = new URLSearchParams(location.search).get("id");

  function auth() {
    return { Authorization: `Bearer ${localStorage.getItem("sb_token")}` };
  }

  async function loadItem() {
    if (!id) return;
    const res = await fetch(`${API_BASE}/api/${endpoint}/${id}`);
    const data = await res.json();
    commonName.value = data.name || "";
    description.value = data.description || "";
    category.value = data.category || "";
    if (data.qr_code_url) {
      qrImage.src = data.qr_code_url;
      qrLink.href = `${isPlant?"Plant":"Fish"}View.html?id=${id}`;
      qrSection.style.display = "block";
    }
  }

  async function saveForm() {
    const fd = new FormData();
    fd.append("name", commonName.value);
    fd.append("description", description.value);
    if (category.value) fd.append("category", category.value);
    if (imageUpload.files.length) fd.append("image", imageUpload.files[0]);

    const res = await fetch(
      id ? `${API_BASE}/api/${endpoint}/${id}` : `${API_BASE}/api/${endpoint}`,
      { method: id ? "PUT" : "POST", headers: auth(), body: fd }
    );

    const json = await res.json();
    if (!res.ok) return alert("Save failed");

    if (!id && json.plant || json.fish) {
      qrImage.src = (json.plant || json.fish).qr_code_url;
      qrSection.style.display = "block";
      return;
    }

    location.href = redirect;
  }

  window.saveForm = saveForm;
  loadItem();
});
