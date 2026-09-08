export type AppErrorCode =
  | "INVALID_ACCESS"
  | "TOKEN_EXPIRED"
  | "UNAUTHORIZED"
  | "NO_COIN"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "NETWORK"
  | "UNKNOWN";

export type AppError = {
  code: AppErrorCode;
  httpStatus?: number;
  message?: string;
  raw?: unknown;
};

const APP_ERROR_CODES = new Set<AppErrorCode>([
  "INVALID_ACCESS",
  "TOKEN_EXPIRED",
  "UNAUTHORIZED",
  "NO_COIN",
  "FORBIDDEN",
  "NOT_FOUND",
  "SERVER_ERROR",
  "NETWORK",
  "UNKNOWN",
]);

const mapErrorCode = (n?: number): AppErrorCode => {
  switch (n) {
    case 1011:
      return "NO_COIN";
    case 1012:
      return "INVALID_ACCESS";
    case 1016:
      return "TOKEN_EXPIRED";
    case 1017:
      return "UNAUTHORIZED";
    default:
      return "UNKNOWN";
  }
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isAppError(x: unknown): x is AppError {
  return (
    isRecord(x) &&
    typeof x.code === "string" &&
    APP_ERROR_CODES.has(x.code as AppErrorCode)
  );
}

function isAxiosLike(x: unknown): x is {
  response?: { status?: number; data?: unknown };
  request?: unknown;
  message?: string;
  config?: unknown;
} {
  return isRecord(x) && ("response" in x || "request" in x);
}

export function toAppError(err: unknown): AppError {
  if (isAppError(err)) return err;

  if (isAxiosLike(err)) {
    const res = err.response;

    if (!res) {
      return {
        code: "NETWORK",
        message: err.message ?? "네트워크 오류가 발생했습니다.",
        raw: err,
      };
    }

    const { status, data } = res;

    if (isRecord(data) && data.success === false) {
      const code =
        typeof data.errorCode === "number"
          ? mapErrorCode(data.errorCode)
          : "UNKNOWN";
      const message =
        typeof data.errorMsg === "string"
          ? data.errorMsg
          : "요청 처리 중 오류가 발생했습니다.";
      return { code, message, httpStatus: status, raw: err };
    }

    switch (status) {
      case 401:
        return {
          code: "UNAUTHORIZED",
          httpStatus: 401,
          message: "인증이 필요합니다.",
          raw: err,
        };
      case 403:
        return {
          code: "FORBIDDEN",
          httpStatus: 403,
          message: "접근 권한이 없습니다.",
          raw: err,
        };
      case 404:
        return {
          code: "NOT_FOUND",
          httpStatus: 404,
          message: "요청하신 리소스를 찾을 수 없습니다.",
          raw: err,
        };
      case 500:
        return {
          code: "SERVER_ERROR",
          httpStatus: 500,
          message: "서버 오류가 발생했습니다.",
          raw: err,
        };
      default:
        return {
          code: "UNKNOWN",
          httpStatus: status,
          message: "알 수 없는 오류가 발생했습니다.",
          raw: err,
        };
    }
  }

  if (err instanceof Error) {
    return {
      code: "UNKNOWN",
      message: err.message || "알 수 없는 오류가 발생했습니다.",
      raw: err,
    };
  }

  return {
    code: "UNKNOWN",
    message: "알 수 없는 오류가 발생했습니다.",
    raw: err,
  };
}
