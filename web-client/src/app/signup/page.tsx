"use client";

import { errorToast, successToast } from "@/lib/toast";
import { useService } from "@/service/useService";
import styles from "@/styles/auth/signup.module.css";
import { useCallback, useEffect, useState } from "react";
import ProfileImageSelector from "../components/ProfileImageSelector";
import StatusIcon from "../components/StatusIcon";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState<string>("");
  const [emailAvailable, setEmailAvailable] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>(
    sampleAvatars[0]
  );
  const { authService, fileService } = useService();
  const router = useRouter();

  const handleCheckEmail = useCallback(async () => {
    const regExp =
      /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    if (!regExp.test(email)) {
      setEmailAvailable(false);
      return;
    }
    try {
      const res = await authService.checkEmail({ email });
      setEmailAvailable(res);
    } catch (error) {
      setEmailAvailable(false);
    }
  }, [email, setEmailAvailable]);

  const handleSignUp = useCallback(async () => {
    if (password !== confirmPassword) {
      errorToast("비밀번호가 일치하지 않습니다.");
    }

    if (password.length < 8) {
      errorToast("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (!emailAvailable) {
      errorToast("이메일을 확인해주세요.");
      return;
    }

    if (name.length === 0) {
      errorToast("이름을 입력해주세요.");
      return;
    }

    try {
      await authService.register({
        email,
        password,
        name,
        profile_picture_url: profilePictureUrl,
      });

      await authService.login({ email, password });

      window.location.href = "/";

      successToast("회원가입에 성공했습니다.");
    } catch (error) {
      errorToast("회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }, [email, password, confirmPassword, name, profilePictureUrl, authService]);

  useEffect(() => {
    if (email.length > 0) {
      handleCheckEmail();
    }
  }, [email, handleCheckEmail, password]);

  useEffect(() => {
    authService.checkLogIn().then((res) => {
      if (res) {
        window.location.href = "/";
      }
    });
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <img src="/logo-text.svg" width={300} height={200} alt="Logo" />
        <h1>회원가입</h1>
        <div className={styles.form}>
          <p>{"로그인에 이용할 이메일을 입력해주세요"}.</p>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <div>
            <StatusIcon status={emailAvailable} size={16} />
          </div>
        </div>
        <div className={styles.form}>
          <p>{"비밀번호를 입력해주세요."}</p>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          />
          <div>
            <StatusIcon
              status={password === confirmPassword && password !== ""}
              size={16}
            />
          </div>
        </div>
        <div className={styles.form}>
          <p>{"이름을 입력해주세요."}</p>
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        <div className={styles.form}>
          <p>{"프로필 사진을 선택해주세요. (선택)"}</p>
          <ProfileImageSelector
            size={100}
            imageUrl={profilePictureUrl}
            setImageUrl={setProfilePictureUrl}
          />
        </div>
        <button onClick={handleSignUp}>{"회원가입"}</button>
        <hr />
        <p className={styles.info}>
          {"이미 계정이 있으신가요? "}
          <a onClick={() => router.push("/signin")}>{"로그인"}</a>
        </p>
      </div>
    </main>
  );
}

const sampleAvatars = [
  "https://storage.ams.lighterlinks.io/assets/sample/avatar_placeholder.png",
];
