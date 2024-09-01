import { User } from "@/service/user/interface";
import styles from "@/styles/components/UserBlock.module.css";

export default function UserBlock({ userData }: { userData: User | null }) {
  if (userData) {
    return (
      <div className={styles.container}>
        <img
          src={userData.profile_picture_url}
          alt="profile"
          width={40}
          height={40}
        />
        <div className={styles.info}>
          <h3>{userData.name}</h3>
          <p>{userData.email}</p>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
