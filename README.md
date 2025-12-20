# 🌿 MyGardenBook — Frontend

MyGardenBook is a responsive, role-based web application that allows users to explore plants and fishes through images, categories, QR codes, and AI-powered queries, while providing administrators full control over content management.

This repository contains the **frontend** of the application, built with vanilla HTML, CSS, and JavaScript, focusing on clean UX, mobile responsiveness, and real-world usability.

---

## 🚀 Live Application

👉 Frontend is deployed on **Vercel**  
👉 Backend API is hosted separately (see backend repo)

---

## 🧩 Features Overview

### 👤 User Features
- Browse **Plants** and **Fishes**
- View items by **Categories**
- Search, filter, and sort content
- Detailed view with:
  - Images
  - Scientific & common names
  - Descriptions
  - QR code (scan-enabled)
- Flip-card UI for image ↔ QR interaction
- AI-powered “Ask AI” section for each item
- Fully mobile-responsive UI

### 🛠️ Admin Features
- Secure admin-only dashboard
- Add / edit / delete plants and fishes
- Upload images
- Auto QR code generation & display
- Manage categories
- Bulk delete items
- Export data (CSV)
- Clear role-based routing (Admin vs User)

---

## 🧱 Tech Stack

- **HTML5**
- **CSS3 (custom, no frameworks)**
- **Vanilla JavaScript**
- **Fetch API**
- **Cloudinary (media hosting)**
- **Supabase Auth (JWT-based authentication)**

> No frontend frameworks were used intentionally, to demonstrate strong fundamentals and control over DOM, layout, and state handling.

---

## 🗂️ Project Structure

/
├── Admin.html
├── User.html
├── Login.html
├── UserPlants.html
├── UserFishes.html
├── AdminPlants.html
├── AdminFishes.html
├── UserEachPlant.html
├── UserEachFish.html
├── js/
│ ├── config.js # Environment config (API base)
│ ├── chat.js # AI chat handler
│ └── AdminAddEdit.js # Shared admin logic
├── assets/
│ └── icons / images

---

## 🔐 Authentication & Roles

- Authentication handled via **Supabase**
- JWT token stored in `localStorage`
- Roles supported:
  - `admin`
  - `user`
- Frontend enforces:
  - Route protection
  - Role-based redirects
  - Access control to admin pages

---

## 🔁 Data Flow (Frontend)

1. User/Admin logs in
2. JWT token stored locally
3. Frontend calls backend APIs using `fetch`
4. Data rendered dynamically
5. Images & QR codes served from Cloudinary
6. AI queries sent via backend proxy

---

## 🎨 UI/UX Design Principles

- Mobile-first responsive design
- Consistent navigation (uniform back arrow)
- Clear visual hierarchy
- Minimal distractions
- Accessibility-friendly buttons & spacing

---

## ⚠️ Known Limitations

- No frontend framework (intentional tradeoff)
- No automated UI testing
- Client-side filtering for search & sort

---

## 📌 Future Improvements

- Shared JS utilities refactor
- Component abstraction
- Accessibility audit
- Frontend test coverage
- Performance optimization for large datasets

---

## 📄 License

This project is for educational and portfolio purposes.
