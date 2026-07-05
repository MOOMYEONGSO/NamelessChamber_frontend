import client from "../../../api/client";
import { unwrap } from "../../../api/helpers";
import type { ApiResponse } from "../../../api/types";
import type { RandomPostResponse } from "../types/types";

export const fetchRandomPosts = async (
  count: number = 3,
  tags: string[] = [],
  reroll: number = 0,
): Promise<RandomPostResponse> => {
  const response = await client.get<ApiResponse<RandomPostResponse>>(
    "/posts/random",
    {
      params: { count, tags, reroll },
    },
  );

  return unwrap(response);
};
