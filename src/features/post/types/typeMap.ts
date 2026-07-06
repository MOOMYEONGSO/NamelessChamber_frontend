export const UI_TO_POST_TYPE = {
  text: "TEXT",
  image: "IMAGE",
} as const;

export type UiType = keyof typeof UI_TO_POST_TYPE;
export type ApiType = (typeof UI_TO_POST_TYPE)[UiType];

export function isUiType(type?: string): type is UiType {
  return type === "text" || type === "image";
}
