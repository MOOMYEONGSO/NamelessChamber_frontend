import client from "../../../api/client";
import type { PostType } from "../types/types";
import type { AdminPostResponse} from "../../admin/types/adminPost";
import type { TodayMetricsResponse } from "../types/types";
import { unwrap } from "../../../api/helpers";

export type AdminPostDetailResponse = AdminPostResponse;

export const adminPostApi = {
  async getAll(type?: PostType): Promise<AdminPostResponse[]> {
    const res = await client.get<AdminPostResponse[]>("/admin/posts", {
      params: type ? { type } : undefined,
    });
    return res.data;
  },

  async getById(postId: string): Promise<AdminPostDetailResponse> {
    const res = await client.get<AdminPostDetailResponse>(`/admin/posts/${postId}`);
    return res.data;
  },

  async remove(postId: string): Promise<void> {
    await client.delete(`/admin/posts/${postId}`);
  },
  async getTodayMetrics(): Promise<TodayMetricsResponse> {
    const res = await client.get("/admin/metrics/today");
    return unwrap<TodayMetricsResponse>(res);
  },
};
