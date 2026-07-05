import type { DiaryImage, PostType } from "../../diary/types/types";

export type AdminPostStatus = "ACTIVE" | "PENDING" | "DELETED" | string;

export type AdminPostResponse = {
  postId: string;
  content: string;
  userId: string;
  type: PostType;
  from: string;
  to: string;
  status: AdminPostStatus;
  commentCount: number;
  views: number;
  likes: number;
  images: DiaryImage[];
  createdAt: string;
};
