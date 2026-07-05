import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { postApi } from "../api/post";
import type { CreatePostRequest, CreatePostResponse } from "../types/types";
import { AxiosError } from "axios";
import { useToast } from "../../../contexts/ToastContext";

type Res = CreatePostResponse;
type Vars = CreatePostRequest;
type ErrorResponseBody = {
  errorMsg?: string;
  message?: string;
};

function getErrorMessage(err: unknown) {
  const ax = err as AxiosError<ErrorResponseBody>;
  const msgFromServer =
    ax?.response?.data?.errorMsg || ax?.response?.data?.message || ax?.message;
  return (
    msgFromServer || "알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요."
  );
}

export function useCreatePost(
  options?: UseMutationOptions<Res, AxiosError, Vars, unknown>,
) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<Res, AxiosError, Vars, unknown>({
    mutationFn: (body: Vars) => postApi.create(body),

    onSuccess: (data, vars, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      options?.onSuccess?.(data, vars, onMutateResult, context);
    },

    onError: (error, vars, onMutateResult, context) => {
      showToast(getErrorMessage(error), "cancel");
      options?.onError?.(error, vars, onMutateResult, context);
    },

    onSettled: (data, err, vars, onMutateResult, context) => {
      options?.onSettled?.(data, err, vars, onMutateResult, context);
    },
  });
}
