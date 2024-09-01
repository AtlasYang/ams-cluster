import styles from "@/styles/components/Modals.module.css";

export default function QRCodeDisplayModal({
  link,
  close,
}: {
  link: string;
  close: () => void;
}) {
  return (
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={close}>
        <span>&times;</span>
      </button>
      <img
        className={styles.qrCode}
        src={link}
        alt="QR Code"
        width={720}
        height={720}
      />
    </div>
  );
}
