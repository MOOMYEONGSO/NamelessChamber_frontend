export const UI_TO_POST_TYPE = {
  public: "TEXT",
  mind: "TEXT",
  today: "TEXT",
} as const;

export type UiType = keyof typeof UI_TO_POST_TYPE;
export type ApiType = (typeof UI_TO_POST_TYPE)[UiType];
