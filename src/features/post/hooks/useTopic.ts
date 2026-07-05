import { useQuery } from "@tanstack/react-query";
import { topicApi } from "../api/topic";

export function useTopic(enabled = true) {
  const todayKey = new Date().toISOString().slice(0, 10);

  return useQuery({
    queryKey: ["topic", todayKey],
    queryFn: () => topicApi.get(),
    enabled,
    staleTime: 1000 * 60,
    retry: false,
  });
}
