# Auth Feature (Admin Frontend)

This folder contains all authentication-related logic for the admin frontend. It includes:

- **API calls** for admin login, logout, and token refresh
- **State management** for admin authentication status and info
- **Types** for authentication requests and responses
- **Helpers** for handling authentication flows
- **"Remember me" logic**: login form and auth store support persistent (localStorage) or session (sessionStorage) authentication based on admin choice
- **Secure, httpOnly refresh token cookies**: backend integration for robust session management

## Usage

- Import and use the exported hooks and API functions in your admin pages/components to manage authentication.
- Handles token storage, admin session, and error handling.
- When logging in, pass the `rememberMe` flag to control session persistence.

## Recent Updates

- "Remember me" support: persistent login across browser restarts if checked, session-only if not
- Auth state is stored in localStorage or sessionStorage accordingly
- Backend and admin-frontend fully integrated for this feature
