"use client";

import { useService } from "@/service/useService";
import styles from "@/styles/auth/signin.module.css";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Signin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { authService } = useService();
  const router = useRouter();

  const handleSignIn = useCallback(async () => {
    try {
      await authService.login({ email, password });
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  }, [email, password, authService]);

  useEffect(() => {
    authService.checkLogIn().then((res) => {
      console.log(res);
      // if (res) {
      //   window.location.href = "/";
      // }
    });
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <img src="/logo-text.svg" alt="logo" width={300} height={200} />
        <input
          className={styles.input}
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className={styles.button} onClick={handleSignIn}>
          로그인
        </button>
        <hr />
        <p className={styles.info}>
          {"계정이 없으신가요? "}
          <a onClick={() => router.push("/signup")}>{"회원가입"}</a>
        </p>
      </div>
    </main>
  );
}
