"use client";

import styles from "@/styles/group/MobileView.module.css";
import ImageIcon from "@/assets/icons/ImageIcon";
import { Group } from "@/service/group/interface";
import { Notification } from "@/service/notification/interface";
import { useService } from "@/service/useService";
import { useEffect, useState } from "react";
import useModal from "@/lib/useModal";
import NotificationModal from "@/app/components/group/NotificationModal";

export default function NotificationScreen({
  groupData,
}: {
  groupData: Group;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<number>(-1);
  const { notificationService } = useService();
  const {
    openModal: openNotificationModal,
    closeModal: closeNotificationModal,
    renderModal: renderNotificationModal,
  } = useModal();

  const handleGetNotifications = async () => {
    const notifications =
      await notificationService.getNotificationsByUserIdAndGroupId({
        group_id: groupData.group_id,
      });
    setNotifications(notifications);
  };

  useEffect(() => {
    handleGetNotifications();
  }, []);

  return (
    <div className={styles.container}>
      <h1>그룹 알림</h1>
      <div className={styles.basicList}>
        {notifications.map((notification) => (
          <div
            onClick={() => {
              setSelectedNotification(notification.notification_id);
              notificationService.markNotificationAsRead({
                notification_id: notification.notification_id,
              });
              openNotificationModal();
              handleGetNotifications();
            }}
            key={notification.notification_id}
            className={`${styles.notificationItem} ${
              notification.read && styles.read
            }`}
          >
            <h3>{notification.message}</h3>
            <div>
              <p>
                {notification.created_at
                  ? new Date(notification.created_at).toLocaleString()
                  : ""}
              </p>
              <span>
                {notification.image_url && (
                  <ImageIcon size={16} color="#C2C2C2" />
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
      {renderNotificationModal(
        <NotificationModal
          data={
            notifications.find(
              (notification) =>
                notification.notification_id === selectedNotification
            ) as Notification
          }
          close={() => {
            closeNotificationModal();
            handleGetNotifications();
          }}
        />
      )}
    </div>
  );
}
