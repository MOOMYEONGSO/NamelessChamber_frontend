import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toAppError } from "../api/errors";
import type { AppError } from "../api/errors";

function redirectToError(code: AppError["code"], message?: string) {
  const qs = new URLSearchParams();
  qs.set("code", code);
  if (message) qs.set("message", message);
  window.location.replace(`/error?${qs.toString()}`);
}

const isRouteBlocking = (err: unknown) => {
  const e = toAppError(err);
  return (
    e.code === "NO_COIN" ||
    e.code === "INVALID_ACCESS" ||
    e.code === "FORBIDDEN" ||
    e.code === "NOT_FOUND" ||
    e.code === "UNAUTHORIZED"
  );
};

function handleGlobalError(err: unknown) {
  const e = toAppError(err);

  switch (e.code) {
    case "INVALID_ACCESS":
      redirectToError("INVALID_ACCESS", "정상 경로로 다시 시도해주세요.");
      break;

    case "FORBIDDEN":
    case "NOT_FOUND":
      redirectToError(e.code, e.message);
      break;

    case "UNAUTHORIZED":
      redirectToError("UNAUTHORIZED", e.message ?? "인증이 필요합니다.");
      break;

    default:
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      handleGlobalError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleGlobalError(error);
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) =>
        isRouteBlocking(error) ? false : failureCount < 1,
      throwOnError: false,
    },
    mutations: {
      throwOnError: false,
    },
  },
});
