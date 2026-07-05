import { useQuery } from "@tanstack/react-query";
import { diaryApi } from "../api/diary";
import type { PostType } from "../types/types";

export function useDiaries({ type }: { type: PostType | undefined }) {
  return useQuery({
    queryKey: ["diaries", type],
    queryFn: () => diaryApi.getAll(type),
  });
}
