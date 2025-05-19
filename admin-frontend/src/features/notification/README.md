# Notification Feature

This folder manages the global notification (toast) system for the frontend application. It includes:

- **Notification store** (Zustand) for managing notification state
- **Notification types** (success, error, info, etc.)
- **UI integration** with the toast/sonner provider
- **Duplicate suppression** and improved UX for validation and error messages

Typical usage:

- Use the notification store's methods (e.g., `addNotification`) to trigger toasts from anywhere in the app.
- Notifications are automatically translated and styled according to their type.
