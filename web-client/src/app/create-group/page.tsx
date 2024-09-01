"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import { useService } from "@/service/useService";
import ProfileImageSelector from "../components/ProfileImageSelector";
import { errorToast } from "@/lib/toast";
import ArrowLeftIcon from "@/assets/icons/ArrowLeftIcon";
import { useRouter } from "next/navigation";
import StatusIcon from "../components/StatusIcon";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState<string>("");
  const [groupNameAvailable, setGroupNameAvailable] = useState<boolean>(false);
  const [groupDescription, setGroupDescription] = useState<string>("");
  const [groupImage, setGroupImage] = useState<string>("");
  const [allowJoin, setAllowJoin] = useState<boolean>(true);
  const { groupService } = useService();
  const router = useRouter();

  useEffect(() => {
    if (!groupName) {
      setGroupNameAvailable(false);
      return;
    }
    groupService
      .checkGroupNameAvailable({
        group_name: groupName,
      })
      .then((res) => {
        setGroupNameAvailable(res);
      });
  }, [groupName]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div
          className={styles.back}
          onClick={() => {
            router.push("/");
          }}
        >
          <ArrowLeftIcon size={20} color="black" />
        </div>
        <h1>그룹 생성하기</h1>
        <div className={styles.form}>
          <p>
            그룹 이름
            <br />
            <small>그룹을 식별할 수 있는 고유 이름입니다.</small>
          </p>
          <input
            className={styles.input}
            type="text"
            placeholder="그룹 이름"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div>
            <StatusIcon status={groupNameAvailable} size={16} />
          </div>
        </div>
        <div className={styles.form}>
          <p>
            그룹 설명
            <br />
            <small>모두가 볼 있는 간단한 설명입니다.</small>
          </p>
          <input
            className={styles.input}
            type="text"
            placeholder=""
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
          />
        </div>
        <div className={styles.form}>
          <p>그룹 이미지</p>
          <ProfileImageSelector
            size={100}
            imageUrl={groupImage}
            setImageUrl={setGroupImage}
            defaultImageUrl="https://storage.ams.lighterlinks.io/assets/placeholder.jpg"
          />
        </div>
        <div className={styles.form}>
          <label>
            <input
              type="checkbox"
              checked={allowJoin}
              onChange={(e) => setAllowJoin(e.target.checked)}
            />
            가입 승인 없이 가입 허용
          </label>
        </div>
        <button
          className={styles.button}
          onClick={async () => {
            if (!groupNameAvailable) {
              errorToast("그룹 이름을 확인해주세요.");
              return;
            }

            await groupService.createGroup({
              name: groupName,
              description: groupDescription,
              group_picture_url: groupImage,
              allow_unapproved_join: allowJoin,
            });

            router.push("/");
          }}
        >
          생성
        </button>
      </div>
    </main>
  );
}
