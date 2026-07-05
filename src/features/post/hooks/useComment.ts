import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../api/post";

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => postApi.createComment(postId, content),
    onSuccess: () => {
      // 상세 조회 쿼리 무효화하여 댓글 리스트 갱신
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      postApi.deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}
