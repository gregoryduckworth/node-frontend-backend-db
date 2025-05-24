# Admin Frontend

A modern React + Vite admin dashboard for the HR App. Provides robust admin authentication (with "remember me"), user and role management, multilingual support, and a responsive UI for administrators.

---

## 🚀 Tech Stack

- **React** (with Vite for fast builds and HMR)
- **TypeScript**
- **Tailwind CSS** for styling
- **React Router** for routing
- **Zustand** for state management
- **i18next** for internationalization (English, Spanish)
- **Custom notification system**

---

## 📦 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:5174](http://localhost:5174) by default (or as configured).

---

## ✨ Features

- 🔐 **Admin Authentication**
  - Login with "remember me" support (persistent or session-based auth)
  - Secure, httpOnly refresh token cookies
- 🛡️ **Role & User Management**
  - View and manage users and roles from the admin dashboard
  - Sidebar navigation for admin features
- 🌍 **Language Switching**
  - Easily switch between English and Spanish
- 📱 **Mobile-Responsive UI**
  - Fully responsive design for all devices
- 🔔 **Notifications**
  - Real-time toast notifications for actions and errors
- 🧑‍💻 **Developer Tools**
  - Easy integration with backend for admin management

---

## 🆕 Recent Functionality

- **"Remember Me" Authentication:**
  - Login form includes a "Remember me" checkbox
  - Auth state and refresh token cookie are persistent or session-based depending on this option
- **Improved Auth Store:**
  - Uses localStorage or sessionStorage based on "remember me" for robust session handling
- **Admin Users Page:**
  - Admins can view and manage users and roles
  - Sidebar navigation for admin features

---

## 📄 Project Structure

```
admin-frontend/
├── src/
│   ├── api/           # API client logic
│   ├── components/    # Reusable UI components
│   ├── config/        # App configuration
│   ├── features/      # Feature modules (auth, dashboard, notification, users, etc.)
│   ├── hooks/         # Custom React hooks
│   ├── i18n/          # Internationalization setup
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components (login, dashboard, users, etc.)
│   └── main.tsx       # App entry point
├── public/            # Static assets
├── index.html         # HTML template
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
