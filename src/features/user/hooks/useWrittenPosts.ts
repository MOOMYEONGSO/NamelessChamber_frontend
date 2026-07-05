import { useQuery } from "@tanstack/react-query";
import type { PostPreview } from "../../post/types/types";
import { userApi } from "../api/user";

export function useWrittenPosts() {
  return useQuery<PostPreview[]>({
    queryKey: ["user", "writtenPosts"],
    queryFn: userApi.getWrittenPosts,
  });
}
