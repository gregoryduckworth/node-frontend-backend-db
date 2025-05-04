# 🌐 Full Stack Web Application

A modern full-stack application featuring user authentication, a responsive dashboard interface, multilingual support, and real-time notifications.

---

## 📁 Project Structure

```
node-frontend-backend-db/
├── backend/   # Node.js + Express + Prisma
└── frontend/  # React + Vite + Tailwind
```

---

## 🚀 Tech Stack

### 🛠 Backend

- **Node.js** with **Express.js**
- **TypeScript**
- **Prisma ORM** for database interaction
- **JWT-based Authentication** with refresh token support
- **RESTful API** architecture

### 🎨 Frontend

- **React** (bundled with Vite)
- **TypeScript** for static typing
- **Tailwind CSS** for utility-first styling
- **React Router** for routing
- **i18n** internationalization (English, Spanish)
- **Custom state management** for application logic

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
   ```

---

### 🐳 Running with Docker

```bash
# Start all services (frontend, backend, database)
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

---

## ✨ Features

- 🔐 Secure Authentication (Login, Register, Forgot Password)
- 📊 User Dashboard with dynamic data
- 📱 Mobile-Responsive UI
- 🌍 Language Switching (English & Spanish)
- 🔔 Real-Time Notifications (via WebSockets or polling)

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
