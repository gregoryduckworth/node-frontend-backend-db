# Frontend (User App)

A modern React + Vite frontend for the HR App, featuring robust authentication (with "remember me"), multilingual support, responsive UI, and real-time notifications.

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

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

---

## ✨ Features

- 🔐 **Authentication**
  - Login, Register, Forgot Password
  - "Remember me" support: persists login across browser restarts if checked (uses localStorage and long-lived refresh token cookie)
  - Session-only login if unchecked (uses sessionStorage and session cookie)
  - Secure, httpOnly refresh token cookies
- 👤 **User Dashboard**
  - Personalized dashboard after login
- 🌍 **Language Switching**
  - Easily switch between English and Spanish
- 📱 **Mobile-Responsive UI**
  - Fully responsive design for all devices
- 🔔 **Notifications**
  - Real-time toast notifications for actions and errors
- 🧑‍💻 **Developer Tools**
  - Easy integration with backend for authentication and user management

---

## 🆕 Recent Functionality

- **"Remember Me" Authentication:**
  - Login form includes a "Remember me" checkbox
  - Auth state and refresh token cookie are persistent or session-based depending on this option
- **Improved Auth Store:**
  - Uses localStorage or sessionStorage based on "remember me" for robust session handling
- **Error Handling:**
  - User-friendly error messages for all auth flows
- **i18n:**
  - All UI strings are translatable and language can be switched at runtime

---

## 📄 Project Structure

```
frontend/
├── src/
│   ├── api/           # API client logic
│   ├── components/    # Reusable UI components
│   ├── config/        # App configuration
│   ├── features/      # Feature modules (auth, dashboard, notification, etc.)
│   ├── hooks/         # Custom React hooks
│   ├── i18n/          # Internationalization setup
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components (login, register, dashboard, etc.)
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
