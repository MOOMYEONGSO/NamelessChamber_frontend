export const PATHS = {
  HOME: "/",
  POST_ALL: "/post",
  POST_LIST: "/post/:type",
  POST_SUBMIT: "/post/submit/:type",
  POST_NEW: "/post/new/:type",
  POST_DETAIL: "/post/v/:id",
  POST_STREAK: "/post/streak/:type",
  LOGIN: "/login",
  ADMIN_POSTS: "/admin/posts",
  SIGN_UP: "/signup",
  NICKNAME: "/signup/nickname",
  ERROR: "/error",
  PROFILE: "/profile",
  FEEDBACK: "/feedback",
  POST_REROLL: "/post/reroll/:type",
  POST_NEW_IMAGE: "/post/new/image",

  ADMIN_POSTS_BY_TYPE: (type: string) => `/admin/posts/${type}`,
  ADMIN_POST_DETAIL: (postId: string) => `/admin/posts/v/${postId}`,
  POST_LIST_TYPE: (type: "today" | "public" | "mind") => `/post/${type}`,
  POST_SUBMIT_TYPE: (type: "today" | "public" | "mind") =>
    `/post/submit/${type}`,
  POST_DETAIL_ID: (id: string) => `/post/v/${id}`,
  POST_NEW_TYPE: (type: "today" | "public" | "mind") => `/post/new/${type}`,
  POST_STREAK_TYPE: (type: "today" | "public" | "mind") =>
    `/post/streak/${type}`,
  POST_REROLL_TYPE: (type: string) => `/post/reroll/${type}`,
} as const;
