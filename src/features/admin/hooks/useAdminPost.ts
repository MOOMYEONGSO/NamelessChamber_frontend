import { useQuery } from "@tanstack/react-query";
import type { AdminPostResponse } from "../types/adminPost";
import { adminPostApi } from "../../post/api/post.admin";

export function useAdminPost(id?: string) {
  return useQuery<AdminPostResponse>({
    queryKey: ["admin", "post", "detail", id],
    queryFn: () => adminPostApi.getById(id as string),
    enabled: !!id,
  });
}