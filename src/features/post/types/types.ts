import type { ApiResponse } from "../../../api/types";
import type { tags as PostTag } from "./tags";

export type PostType = "TEXT" | "IMAGE";

export type CreatePostRequest = {
  from?: string;
  to?: string;
  content: string;
  tags: PostTag[];
};

export type CreateImagePostRequest = Omit<CreatePostRequest, "content">;

export type CreatePostResponse = {
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

export type PostPreview = {
  postId: string;
  userId: string;
  type: PostType;
  from: string;
  to: string;
  contentPreview: string;
  contentLength: number;
  tags: PostTag[];
  likes: number;
  views: number;
  commentCount: number;
  createdAt: string;
  thumbnailUrl?: string | null;
};

export type PostsPayload = {
  coin: number;
  posts: PostPreview[];
};

export type Comment = {
  commentId: string;
  authorId: string;
  authorNickname: string;
  content: string;
  createdAt: string;
  mine: boolean;
};

export type PostImage = {
  imageId: string;
  imageUrl: string;
  thumbnailUrl: string;
  sortOrder: number;
};

export type PostDetail = {
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
  images: PostImage[];
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

export type GetPostsResponse = ApiResponse<
  PostsPayload & { nextCursor?: string | null }
>;
export type GetPostResponse = ApiResponse<PostDetail>;

export type RandomPost = PostPreview;

export type RandomPostResponse = {
  coin: number;
  posts: RandomPost[];
};
