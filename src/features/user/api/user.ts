import client from "../../../api/client";
import { unwrap, unwrapNoContent } from "../../../api/helpers";
import type { ApiResponse } from "../../../api/types";
import type { PostPreview, PostType } from "../../post/types/types";
import type { ReadPosts, UserMe } from "../type/types";

export const userApi = {
  async createNickname(nickname: string): Promise<void> {
    const res = await client.post<ApiResponse<unknown>>(
      "/users/nickname",
      { nickname },
      { validateStatus: () => true }
    );
    unwrapNoContent(res);
  },
  async getMe(): Promise<UserMe> {
    const res = await client.get<ApiResponse<UserMe>>("/users/me", {
      validateStatus: () => true,
    });

    return unwrap(res);
  },
  async getReadPosts(type?: PostType): Promise<ReadPosts> {
    const res = await client.get<ApiResponse<ReadPosts>>("/posts/me/read", {
      params: type ? { type } : undefined,
    });
    return unwrap<ReadPosts>(res);
  },
  async getWrittenPosts(): Promise<PostPreview[]> {
    const res = await client.get<ApiResponse<PostPreview[]>>("/posts/me");
    return unwrap(res);
  },
};
