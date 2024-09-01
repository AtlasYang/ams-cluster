import axios from "axios";
import { AuthService } from "./auth/api";
import { FileService } from "./file/api";
import { GroupService } from "./group/api";
import { MemberService } from "./member/api";
import { NotificationService } from "./notification/api";
import { SessionService } from "./session/api";
import { UserService } from "./user/api";

export const useService = () => {
  const instance = axios.create({
    // baseURL: "http://localhost:7902",
    baseURL: "https://api-ams.lighterlinks.io",
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (error.response?.status == 401) {
        if (
          window.location.pathname !== "/signin" &&
          window.location.pathname !== "/signup"
        ) {
          window.location.href = "/signin";
        }
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );

  return {
    authService: new AuthService(instance),
    fileService: new FileService(instance),
    groupService: new GroupService(instance),
    memberService: new MemberService(instance),
    notificationService: new NotificationService(instance),
    sessionService: new SessionService(instance),
    userService: new UserService(instance),
  };
};
