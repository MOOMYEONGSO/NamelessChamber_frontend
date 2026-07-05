import client from "../../../api/client";
import { unwrap } from "../../../api/helpers";
import type { ApiResponse } from "../../../api/types";
import type { Topic } from "../types/types";

export const topicApi = {
  async get(): Promise<Topic> {
    const res = await client.get<ApiResponse<Topic>>("/topics/today");
    return unwrap(res);
  },
};
