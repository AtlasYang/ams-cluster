import { Notification } from "@/service/notification/interface";
import styles from "@/styles/components/Modals.module.css";

export default function NotificationModal({
  data,
  close,
}: {
  data: Notification;
  close: () => void;
}) {
  return (
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={close}>
        <span>&times;</span>
      </button>
      <h1>{data.message}</h1>
      <p>{data.created_at ? new Date(data.created_at).toLocaleString() : ""}</p>
      {data.image_url && (
        <img width={300} height={300} src={data.image_url} alt="notification" />
      )}
    </div>
  );
}
