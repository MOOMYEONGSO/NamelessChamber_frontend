import { useQuery } from "@tanstack/react-query";
import { postApi } from "../api/post";

export function usePost(id?: string) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => postApi.getById(id as string),
    enabled: !!id,
  });
}
