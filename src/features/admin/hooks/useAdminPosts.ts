import { useQuery } from "@tanstack/react-query";
import type { PostType } from "../../post/types/types";
import type { AdminPostResponse } from "../types/adminPost";
import { adminPostApi} from "../../post/api/post.admin";

export function useAdminPosts({ type }: { type?: PostType }) {
  return useQuery<AdminPostResponse[]>({
    queryKey: ["admin", "post", "list", type ?? "ALL"],
    queryFn: () => adminPostApi.getAll(type),
  });
}
