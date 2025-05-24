# Notification Feature (Admin Frontend)

This folder manages the global notification (toast) system for the admin frontend. It includes:

- **Notification store** (Zustand) for managing notification state
- **Notification types** (success, error, info, etc.)
- **UI integration** with the toast/sonner provider
- **Duplicate suppression** and improved UX for validation and error messages
- **Real-time notifications** for admin actions (user management, etc.)

## Usage

- Use the notification store's methods (e.g., `addNotification`) to trigger toasts from anywhere in the admin app.
- Notifications are automatically translated and styled according to their type.

## Recent Updates

- Improved error and success notification UX for admin and user management flows
- Notifications for login, logout, and user management events
