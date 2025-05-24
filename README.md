# 🌐 Full Stack Web Application

A modern full-stack application featuring robust authentication (with "remember me" support), admin and user dashboards, multilingual support, and real-time notifications.

---

## 📁 Project Structure

```
node-frontend-backend-db/
├── backend/         # Node.js + Express + Prisma
├── frontend/        # React + Vite + Tailwind (user-facing)
└── admin-frontend/  # React + Vite (admin dashboard)
```

---

## 🚀 Tech Stack

### 🛠 Backend
- **Node.js** with **Express.js**
- **TypeScript**
- **Prisma ORM** for database interaction
- **JWT-based Authentication** with refresh token support
- **RESTful API** architecture
- **Role-based access control** (admin/user separation)
- **Seed script** for initial data and safe upserts

### 🎨 Frontend & Admin Frontend
- **React** (bundled with Vite)
- **TypeScript** for static typing
- **Tailwind CSS** for utility-first styling
- **React Router** for routing
- **i18n** internationalization (English, Spanish)
- **Custom state management** for application logic
- **Admin dashboard** for user/role management

### 🗃 Database
- Relational database (e.g., PostgreSQL, MySQL)
- Managed via **Prisma** (`backend/prisma/schema.prisma`)

---

## ⚙️ Prerequisites
- Node.js `v22` or later
- Docker & Docker Compose
- npm or Yarn package manager

---

## 📦 Getting Started

### 🔽 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gregoryduckworth/node-frontend-backend-db.git
   cd node-frontend-backend-db
   ```
2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install

   # Admin Frontend
   cd ../admin-frontend
   npm install
   ```

---

### 🐳 Running with Docker
```bash
# Start all services (frontend, admin-frontend, backend, database)
docker-compose up
# Or run in detached mode
docker-compose up -d
```

---

### 🧪 Running Locally
1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
2. **Start the frontend in a separate terminal:**
   ```bash
   cd frontend
   npm run dev
   ```
3. **Start the admin frontend in another terminal:**
   ```bash
   cd admin-frontend
   npm run dev
   ```

---

## ✨ Features

- 🔐 **Robust Authentication**
  - Login, Register, Forgot Password
  - "Remember me" support for both admin and user logins (persistent or session-based auth)
  - Secure, httpOnly refresh token cookies
- 👤 **User & Admin Dashboards**
  - Separate admin and user frontends
  - Admin dashboard for user/role management
- 🛡️ **Role-based Access Control**
  - Admin and regular user separation
  - Permissions and roles seeded and managed
- 🌍 **Language Switching** (English & Spanish)
- 📱 **Mobile-Responsive UI**
- 🔔 **Real-Time Notifications** (via WebSockets or polling)
- 🧑‍💻 **Developer Tools**
  - Safe database reset and reseed endpoint for test/dev
  - Seed script uses upsert to prevent duplicate emails

---

## 🆕 Recent Functionality

- **"Remember Me" Authentication:**
  - Both admin and user login forms support a "Remember me" checkbox.
  - When checked, authentication persists across browser restarts (long-lived refresh token cookie and localStorage state).
  - When unchecked, session ends on browser close (session cookie and sessionStorage state).
  - Fully integrated in both admin-frontend and frontend, and supported by backend controllers/services.
- **Admin Dashboard:**
  - Admins can view and manage users and roles.
  - Sidebar navigation for admin features.
- **Seed Script Improvements:**
  - Uses upsert for all users and roles to prevent duplicate emails and ensure idempotency.
- **Database Reset Endpoint:**
  - `/test/reset-db` endpoint resets and reseeds the database for development/testing.

---

## 🤝 Contributing Guide
1. Fork this repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request for review

---

## 📄 License
This project is distributed under the [MIT License](LICENSE).
