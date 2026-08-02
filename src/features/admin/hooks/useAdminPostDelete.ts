import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminPostApi } from "../../post/api/post.admin";

export function useAdminPostDelete() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminPostApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "post"] });
    },
  });
}