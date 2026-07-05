import { useQuery } from "@tanstack/react-query";
import { userApi } from "../api/user";
import type { ReadPosts } from "../type/types";

// 열람한 일기: 타입과 무관하게 내가 읽은 모든 글
export function useReadPosts(enabled = true) {
  return useQuery<ReadPosts>({
    queryKey: ["user", "posts", "read"],
    queryFn: () => userApi.getReadPosts(),
    enabled,
  });
}
