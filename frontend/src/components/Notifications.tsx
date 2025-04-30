import { useEffect } from "react";
import {
  useNotificationStore,
  NotificationType,
} from "../store/useNotificationStore";

interface NotificationProps {
  id: string;
  message: string;
  type: NotificationType;
  onClose: (id: string) => void;
}

const Notification = ({ id, message, type, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  let styles = {
    container:
      "mb-3 p-4 rounded-md shadow-md flex justify-between items-center",
    icon: "mr-3",
    message: "flex-1",
    closeButton: "ml-2 text-gray-500 hover:text-gray-700",
  };

  switch (type) {
    case "success":
      styles.container +=
        " bg-green-100 border-l-4 border-green-500 text-green-700";
      break;
    case "error":
      styles.container += " bg-red-100 border-l-4 border-red-500 text-red-700";
      break;
    case "warning":
      styles.container +=
        " bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700";
      break;
    case "info":
    default:
      styles.container +=
        " bg-blue-100 border-l-4 border-blue-500 text-blue-700";
      break;
  }

  return (
    <div className={styles.container} role="alert">
      <div className={styles.message}>{message}</div>
      <button
        onClick={() => onClose(id)}
        className={styles.closeButton}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
};

const Notifications = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default Notifications;
