import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/user";
import type { ReadDiaries } from "../type/types";

// 열람한 일기: 타입과 무관하게 내가 읽은 모든 글
export function useReadDiaries(enabled = true) {
  return useQuery<ReadDiaries>({
    queryKey: ["user", "diaries", "read"],
    queryFn: () => userApi.getReadDiaries(),
    enabled,
  });
}
