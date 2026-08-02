import type { ApiResponse } from "../../../api/types";
import type { AuthResponse } from "../types/types";
import client from "../../../api/client";
import { unwrap } from "../../../api/helpers";
import { getAccessToken, getRefreshToken, persistAuth } from "./tokenStore";
import type { VisitMotive } from "../constants/signup";

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await client.post<ApiResponse<AuthResponse>>("/auth/login", {
      email,
      password,
    });
    return unwrap<AuthResponse>(res);
  },

  async signup(payload: {
    visitMotive: VisitMotive;
    nickname: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await client.post<ApiResponse<AuthResponse>>(
      "/auth/signup",
      payload,
    );

    return unwrap<AuthResponse>(res);
  },

  // 익명 로그인 비활성화
  // async anonymousLogin(): Promise<AuthResponse> {
  //   const res = await client.post<ApiResponse<AuthResponse>>("/auth/anonymous");
  //   return unwrap<AuthResponse>(res);
  // },
  async logout(): Promise<void> {
    const res = await client.post("/auth/logout", null, {
      headers: { "x-skip-reissue": true },
    });
    unwrap<null>(res);
  },
};

export async function reissueTokens(): Promise<string> {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await client.post<ApiResponse<AuthResponse>>("/auth/reissue", {
    accessToken,
    refreshToken,
  });
  const data = unwrap<AuthResponse>(res);

  persistAuth({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  return data.accessToken as string;
}
