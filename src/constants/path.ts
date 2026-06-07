export const PATHS = {
  HOME: "/",
  DIARY_ALL: "/diary",
  DIARY_LIST: "/diary/:type",
  DIARY_SUBMIT: "/diary/submit/:type",
  DIARY_NEW: "/diary/new/:type",
  DIARY_DETAIL: "/diary/v/:id",
  DIARY_STREAK: "/diary/streak/:type",
  LOGIN: "/login",
  ADMIN_DIARIES: "/admin/diaries",
  SIGN_UP: "/signup",
  NICKNAME: "/signup/nickname",
  ERROR: "/error",
  PROFILE: "/profile",
  FEEDBACK: "/feedback",
  DIARY_REROLL: "/diary/reroll/:type",
  DIARY_NEW_PHOTO: "/diary/new/photo",

  ADMIN_DIARIES_BY_TYPE: (type: string) => `/admin/diaries/${type}`,
  ADMIN_DIARY_DETAIL: (postId: string) => `/admin/diaries/post/${postId}`,
  DIARY_LIST_TYPE: (type: "today" | "public" | "mind") => `/diary/${type}`,
  DIARY_SUBMIT_TYPE: (type: "today" | "public" | "mind") =>
    `/diary/submit/${type}`,
  DIARY_DETAIL_ID: (id: string) => `/diary/v/${id}`,
  DIARY_NEW_TYPE: (type: "today" | "public" | "mind") => `/diary/new/${type}`,
  DIARY_STREAK_TYPE: (type: "today" | "public" | "mind") =>
    `/diary/streak/${type}`,
  DIARY_REROLL_TYPE: (type: string) => `/diary/reroll/${type}`,
} as const;
