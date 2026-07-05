import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { diaryApi } from "../api/diary";
import type { CreateDiaryRequest, CreateDiaryResponse } from "../types/types";
import { AxiosError } from "axios";
import { useToast } from "../../../contexts/ToastContext";

type Res = CreateDiaryResponse;
type Vars = CreateDiaryRequest;
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

export function useCreateDiary(
  options?: UseMutationOptions<Res, AxiosError, Vars, unknown>,
) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<Res, AxiosError, Vars, unknown>({
    mutationFn: (body: Vars) => diaryApi.create(body),

    onSuccess: (data, vars, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ["diaries"] });
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
