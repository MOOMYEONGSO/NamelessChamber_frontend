import { useQuery } from "@tanstack/react-query";
import { fetchRandomPosts } from "../api/randomPost";

export function useRandomPosts(
  count: number = 3,
  tags: string[] = [],
  reroll: number = 0,
) {
  return useQuery({
    queryKey: ["posts", "random", count, tags, reroll],
    queryFn: () => fetchRandomPosts(count, tags, reroll),
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}
