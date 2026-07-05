import client from "../../../api/client";
import { unwrap } from "../../../api/helpers";
import type { ApiResponse } from "../../../api/types";
import type {
  CreateDiaryRequest,
  DiaryDetail,
  PostsPayload,
  CreateDiaryResponse,
  CreateImageDiaryRequest,
  PostType,
} from "../types/types";

const IMAGE_UPLOAD_TIMEOUT_MS = 60_000;

export const diaryApi = {
  async getAll(
    type?: PostType | null,
    cursor?: string | null,
    limit: number = 20,
  ): Promise<PostsPayload & { nextCursor?: string | null }> {
    const res = await client.get<
      ApiResponse<PostsPayload & { nextCursor?: string | null }>
    >("/posts", {
      params: {
        ...(type ? { type } : {}),
        ...(cursor ? { cursor } : {}),
        limit,
      },
    });
    return unwrap(res);
  },
  async getById(id: string): Promise<DiaryDetail> {
    const res = await client.get<ApiResponse<DiaryDetail>>(`/posts/${id}`);
    return unwrap(res);
  },
  async create(body: CreateDiaryRequest): Promise<CreateDiaryResponse> {
    const res = await client.post<ApiResponse<CreateDiaryResponse>>(
      "/posts",
      body,
      { validateStatus: (status) => status !== 401 },
    );
    return unwrap(res);
  },

  getAllRaw() {
    return client.get<ApiResponse<PostsPayload & { nextCursor?: string | null }>>(
      "/posts",
    );
  },
  async createComment(postId: string, content: string): Promise<void> {
    await client.post(`/posts/${postId}/comments`, { content });
  },
  async deleteComment(postId: string, commentId: string): Promise<void> {
    await client.delete(`/posts/${postId}/comments/${commentId}`);
  },
  async createImagePost(
    files: File[],
    request: CreateImageDiaryRequest,
  ): Promise<CreateDiaryResponse> {
    const form = new FormData();
    form.append(
      "request",
      new Blob([JSON.stringify(request)], { type: "application/json" }),
    );
    files.forEach((file) => {
      form.append("images", file);
    });

    const res = await client.post<ApiResponse<CreateDiaryResponse>>(
      "/post-images",
      form,
      { timeout: IMAGE_UPLOAD_TIMEOUT_MS },
    );
    return unwrap(res);
  },
};
