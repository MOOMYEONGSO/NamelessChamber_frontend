import type { ApiResponse } from "../../../api/types";

export type DiaryType = "MOOMYEONGSO" | "DIARY" | "TODAY";

export type PostBody = {
  title: string;
  content: string;
};

export type CreateDiaryRequest = PostBody & {
  // TODO: postType "DIARY" 로 임시 조치 해제
  type: DiaryType | "DIARY" | (string & {});
  tags: string[];
  imageIds?: string[];
};

export type CreateDiaryResponse = {
  postId: string;
  totalPosts: number;
  coin: number;
  showCalendar: boolean;
  calendar: {
    weekStart: string;
    days: boolean[];
    counts: number[];
  };
};

export type DiaryPreview = {
  postId: string;
  userId: string;
  title: string;
  contentPreview?: string;
  contentLength: number;
  tags: string[];
  likes?: number;
  views?: number;
  commentCount?: number;
  createdAt?: string;
  type?: DiaryType;
  imageUrls?: string[];
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

export type DiaryDetail = {
  postId: string;
  title: string;
  content: string;
  likes: number;
  views: number;
  createdAt: string;
  coin: number;
  type?: DiaryType;
  comments: Comment[];
  imageUrls?: string[];
};

export type Topic = {
  title: string;
  status: string;
  publishedDate: string;
};
export type TodayMetricsResponse = {
  publicPosts: number;
  publicTotalPosts: number;
  mindPosts: number;
  mindTotalPosts: number;
  todayPosts: number;
  todayTotalPosts: number;
  members: number;
  totalMembers: number;
  anonymous: number;
};

export type GetDiariesResponse = ApiResponse<DiaryPreview[]>;
export type GetDiaryResponse = ApiResponse<DiaryDetail>;

// Random Diary 응답 타입
export type RandomDiary = {
  postId: string;
  userId: string;
  title: string;
  contentPreview: string;
  contentLength: number;
  tags: string[];
  likes: number;
  views: number;
  createdAt: string;
  type?: DiaryType;
};

export type RandomDiaryResponse = {
  coin: number;
  posts: RandomDiary[];
};
