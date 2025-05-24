# Backend (Node.js + Express + Prisma)

This is the backend API for the HR App. It provides secure authentication, user and admin management, role-based access control, and a robust REST API for the frontend and admin-frontend clients.

---

## 🚀 Tech Stack

- **Node.js** with **Express.js**
- **TypeScript**
- **Prisma ORM** (PostgreSQL by default, configurable)
- **JWT Authentication** (access & refresh tokens)
- **Role-based access control** (admin/user separation)
- **RESTful API**
- **Seed script** for initial data and safe upserts

---

## 📦 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

- Copy `.env.example` to `.env` and set your database connection string and secrets.

### 3. Run database migrations

```bash
npx prisma migrate deploy
```

### 4. Seed the database

```bash
npx ts-node prisma/seed.ts
```

### 5. Start the development server

```bash
npm run dev
```

---

## ✨ Features

- 🔐 **Authentication**
  - Login, Register, Forgot Password
  - "Remember me" support for both admin and user logins (persistent/session-based refresh token cookies)
  - Secure, httpOnly refresh token cookies
- 👤 **User & Admin Management**
  - Separate endpoints for admin and user authentication
  - Admin dashboard support (user/role management)
- 🛡️ **Role-based Access Control**
  - Admin and regular user separation
  - Permissions and roles seeded and managed
- 🧑‍💻 **Developer Tools**
  - `/test/reset-db` endpoint resets and reseeds the database for development/testing
  - Seed script uses upsert to prevent duplicate emails and ensure idempotency
- 🗃️ **Prisma ORM**
  - Schema at `prisma/schema.prisma`
  - Client at `prisma/client.ts`

---

## 🆕 Recent Functionality

- **"Remember Me" Authentication:**
  - Both admin and user login endpoints accept a `rememberMe` flag
  - Sets refresh token cookie to 30 days if checked, session cookie if not
- **Seed Script Improvements:**
  - Uses upsert for all users and roles to prevent duplicate emails and ensure idempotency
- **Database Reset Endpoint:**
  - `/test/reset-db` endpoint resets and reseeds the database for development/testing

---

## 📄 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── client.ts          # Prisma client setup
│   └── seed.ts            # Seed script
├── src/
│   ├── app.ts             # Express app setup
│   ├── index.ts           # Entry point
│   ├── controller/        # Route controllers
│   ├── middlewares/       # Express middlewares
│   ├── routes/            # Route definitions
│   ├── service/           # Business logic
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
└── ...
```

---

## 🤝 Contributing

1. Fork this repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request for review

---

## 📄 License

This project is distributed under the [MIT License](../LICENSE).
