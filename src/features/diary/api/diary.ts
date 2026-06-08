import client from "../../../api/client";
import { unwrap } from "../../../api/helpers";
import type { ApiResponse } from "../../../api/types";
import type {
  CreateDiaryRequest,
  DiaryPreview,
  DiaryDetail,
  PostsPayload,
  CreateDiaryResponse,
} from "../types/types";

const IMAGE_UPLOAD_TIMEOUT_MS = 60_000;

type UploadedPostImage = {
  imageId: string;
  imageUrl: string;
  thumbnailUrl: string;
  contentType: string;
  size: number;
  width: number;
  height: number;
};

type PostImageUploadResponse = {
  images: UploadedPostImage[];
};

export const diaryApi = {
  // TODO: 서버 조회 타입 정책 확정 후 DIARY 임시 허용 타입 정리하기.
  async getAll(
    type?: "DIARY" | "MOOMYEONGSO" | "TODAY" | null,
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
    return client.get<ApiResponse<DiaryPreview[]>>("/posts");
  },
  async createComment(postId: string, content: string): Promise<void> {
    await client.post(`/posts/${postId}/comments`, { content });
  },
  async deleteComment(postId: string, commentId: string): Promise<void> {
    await client.delete(`/posts/${postId}/comments/${commentId}`);
  },
  async uploadImages(files: File[]): Promise<string[]> {
    const form = new FormData();
    files.forEach((file) => {
      form.append("images", file);
    });

    const res = await client.post<ApiResponse<PostImageUploadResponse>>(
      "/post-images",
      form,
      { timeout: IMAGE_UPLOAD_TIMEOUT_MS },
    );
    return unwrap(res).images.map((image) => image.imageId);
  },
};
