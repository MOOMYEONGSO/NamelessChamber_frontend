import type { ApiResponse } from "../../../api/types";
import type { tags as DiaryTag } from "./tags";

export type PostType = "TEXT" | "IMAGE";
export type DiaryType = PostType;

export type CreateDiaryRequest = {
  from?: string;
  to?: string;
  content: string;
  tags: DiaryTag[];
};

export type CreateImageDiaryRequest = Omit<CreateDiaryRequest, "content">;

export type CreateDiaryResponse = {
  postId: string;
  totalPosts: number;
  coin: number;
  showCalendar: boolean;
  calendar: {
    weekStart: string;
    days: boolean[];
    counts: number[];
  } | null;
};

export type DiaryPreview = {
  postId: string;
  userId: string;
  type: PostType;
  from: string;
  to: string;
  contentPreview: string;
  contentLength: number;
  tags: DiaryTag[];
  likes: number;
  views: number;
  commentCount: number;
  createdAt: string;
  thumbnailUrl?: string | null;
};

export type PostsPayload = {
  coin: number;
  posts: DiaryPreview[];
};

export type Comment = {
  commentId: string;
  authorId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
  mine: boolean;
};

export type DiaryImage = {
  imageId: string;
  imageUrl: string;
  thumbnailUrl: string;
  sortOrder: number;
};

export type DiaryDetail = {
  postId: string;
  type: PostType;
  from: string;
  to: string;
  content: string;
  likes: number;
  views: number;
  commentCount: number;
  createdAt: string;
  coin: number;
  comments: Comment[];
  images: DiaryImage[];
};

export type Topic = {
  title: string;
  status: string;
  publishedDate: string;
};
export type TodayMetricsResponse = {
  textPosts: number;
  textTotalPosts: number;
  imagePosts: number;
  imageTotalPosts: number;
  members: number;
  anonymous: number;
  totalMembers: number;
};

export type GetDiariesResponse = ApiResponse<
  PostsPayload & { nextCursor?: string | null }
>;
export type GetDiaryResponse = ApiResponse<DiaryDetail>;

export type RandomDiary = DiaryPreview;

export type RandomDiaryResponse = {
  coin: number;
  posts: RandomDiary[];
};
