import { useQuery } from "@tanstack/react-query";
import { adminPostApi } from "../../post/api/post.admin";

export function useTodayMetrics() {
  return useQuery({
    queryKey: ["admin", "metrics", "today"],
    queryFn: () => adminPostApi.getTodayMetrics(),
    staleTime: 1000 * 60,
  });
}