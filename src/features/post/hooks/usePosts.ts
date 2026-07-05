import { useQuery } from "@tanstack/react-query";
import { postApi } from "../api/post";
import type { PostType } from "../types/types";

export function usePosts({ type }: { type: PostType | undefined }) {
  return useQuery({
    queryKey: ["posts", type],
    queryFn: () => postApi.getAll(type),
  });
}
