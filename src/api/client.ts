import axios, { AxiosError, AxiosHeaders } from "axios";
import type { AxiosRequestConfig } from "axios";

import {
  getAccessToken,
  getRefreshToken,
  clearAuth,
  notifyAuthUpdate,
} from "../features/auth/api/tokenStore";
import { reissueTokens } from "../features/auth/api/auth";

/* -------------------------------------------------------
 * Axios Base Client
 * ----------------------------------------------------- */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
});
export default client;

/* -------------------------------------------------------
 * Public (No-Auth) Endpoints
 * ----------------------------------------------------- */
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/reissue",
  // "/auth/anonymous", // 익명 로그인 비활성화
];

function isPublicRequest(config: AxiosRequestConfig) {
  const base = (config.baseURL as string) ?? client.defaults.baseURL ?? "";
  const url = new URL(config.url!, base);
  return PUBLIC_PATHS.some((p) => url.pathname.startsWith(p));
}

/* -------------------------------------------------------
 * Header Helpers
 * ----------------------------------------------------- */
function setAuthHeader(config: AxiosRequestConfig, token: string) {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }
  const h = config.headers as AxiosHeaders;
  if (typeof (h as any).set === "function") {
    (h as any).set("Authorization", `Bearer ${token}`);
  } else {
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  }
}

function removeAuthHeader(config: AxiosRequestConfig) {
  if (!config.headers) return;
  const h = config.headers as AxiosHeaders;
  if (typeof (h as any).delete === "function") {
    (h as any).delete("Authorization");
  } else {
    delete (config.headers as any)["Authorization"];
  }
}

/* -------------------------------------------------------
 * Common Auth-Expired Handler
 * ----------------------------------------------------- */
let __lastRedirectAt = 0;
function handleAuthExpired(reason: string, redirectTo?: string) {
  clearAuth();
  window.dispatchEvent(
    new CustomEvent("auth:expired", { detail: { reason, status: 401 } }),
  );
  notifyAuthUpdate();

  if (redirectTo) {
    const now = Date.now();
    if (now - __lastRedirectAt > 2000) {
      __lastRedirectAt = now;
      window.location.replace(redirectTo);
    }
  }
}
/* -------------------------------------------------------
 * Refresh Queue (for 1016)
 * ----------------------------------------------------- */
// type Waiter = {
//   resolve: (v: any) => void;
//   reject: (e: any) => void;
//   originalRequest: AxiosRequestConfig;
// };

// let isRefreshing = false;
// let queue: Waiter[] = [];

// function enqueue(w: Waiter) {
//   queue.push(w);
// }

// function flush(error: any, newAccess?: string) {
//   const q = [...queue];
//   queue = [];
//   q.forEach(({ resolve, reject, originalRequest }) => {
//     if (newAccess) {
//       setAuthHeader(originalRequest, newAccess);
//       resolve(client(originalRequest));
//     } else {
//       reject(error);
//     }
//   });
// }

/* -------------------------------------------------------
 * Request Interceptor
 * ----------------------------------------------------- */
client.interceptors.request.use((config) => {
  // per-request override: { "x-skip-auth": true }
  const skipByHeader =
    typeof config.headers === "object" &&
    (config.headers as any)["x-skip-auth"] === true;

  if (skipByHeader || isPublicRequest(config)) {
    removeAuthHeader(config);
    return config;
  }

  const token = getAccessToken();
  if (token) {
    setAuthHeader(config, token);
  } else {
    removeAuthHeader(config);
  }
  return config;
});

/* -------------------------------------------------------
 * Response Interceptor
 * ----------------------------------------------------- */
client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const status = error?.response?.status;
    if (status !== 401) return Promise.reject(error);

    const originalRequest = error.config as AxiosRequestConfig;

    // 공개 엔드포인트(로그인/회원가입/재발급/익명)는 재시도 금지
    if (isPublicRequest(originalRequest)) {
      return Promise.reject(error);
    }

    // 무한루프 방지: 요청당 1회만 재시도
    if ((originalRequest as any)._retry) {
      return Promise.reject(error);
    }
    (originalRequest as any)._retry = true;

    // 헤더로 재발급 스킵 지정 시 바로 만료 처리
    const skipReissue =
      typeof originalRequest?.headers === "object" &&
      (originalRequest.headers as any)["x-skip-reissue"] === true;
    if (skipReissue) {
      handleAuthExpired("expired_skip_reissue", "/");
      return Promise.reject(error);
    }

    // 서버 에러코드 기반 빠른 종료 분기(선택) — 정책 유지
    const codeNum: number | undefined = (error?.response as any)?.data
      ?.errorCode;

    const hasRefresh = !!getRefreshToken();

    if (codeNum === 1012 || codeNum === 1017) {
      if (!hasRefresh) {
        handleAuthExpired(codeNum === 1012 ? "invalid_token" : "no_token", "/");
        return Promise.reject(error);
      }
    }

    // 동시 재발급 큐 처리
    type Waiter = {
      resolve: (v: any) => void;
      reject: (e: any) => void;
      originalRequest: AxiosRequestConfig;
    };
    let isRefreshing = (client.defaults as any).__isRefreshing === true;
    (client.defaults as any).__queue = (client.defaults as any).__queue ?? [];

    const enqueue = (w: Waiter) => {
      (client.defaults as any).__queue.push(w);
    };
    const flush = (err: any, newAccess?: string) => {
      const q: Waiter[] = (client.defaults as any).__queue;
      (client.defaults as any).__queue = [];
      q.forEach(({ resolve, reject, originalRequest }) => {
        if (newAccess) {
          setAuthHeader(originalRequest, newAccess);
          resolve(client(originalRequest));
        } else {
          reject(err);
        }
      });
    };

    if (isRefreshing) {
      return new Promise((resolve, reject) =>
        enqueue({ resolve, reject, originalRequest }),
      );
    }

    (client.defaults as any).__isRefreshing = true;
    try {
      const newAccess = await reissueTokens(); // 내부서 tokenStore 갱신
      (client.defaults as any).__isRefreshing = false;
      flush(null, newAccess);
      setAuthHeader(originalRequest, newAccess);
      return client(originalRequest);
    } catch (e) {
      (client.defaults as any).__isRefreshing = false;
      flush(e);
      handleAuthExpired("refresh_failed", "/");
      return Promise.reject(e);
    }
  },
);
