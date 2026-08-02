import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "../../../contexts/ToastContext";
import {
  MAX_IMAGES,
  MAX_TOTAL_BYTES,
  ImagePrepareError,
  prepareUploadFile,
  formatMB,
} from "../utils/imageUpload";

export type LetterImage = {
  file: File;
  previewUrl: string;
};

/**
 * 편지 첨부 이미지 상태 관리(검증·용량 제한·미리보기 URL 정리).
 * PostImagePage의 파일 추가/삭제 로직을 재사용 가능한 훅으로 추출.
 */
export function useLetterImages() {
  const [images, setImages] = useState<LetterImage[]>([]);
  const { showToast } = useToast();
  const imagesRef = useRef<LetterImage[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // 언마운트 시 남은 미리보기 URL 해제 (모바일 대용량 사진 메모리 정리)
  useEffect(
    () => () => {
      imagesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    [],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return;

      const remainingSlots = MAX_IMAGES - images.length;
      if (remainingSlots <= 0) {
        showToast(`사진은 최대 ${MAX_IMAGES}장까지 등록할 수 있어요.`, "cancel");
        return;
      }

      try {
        const prepared = files
          .slice(0, remainingSlots)
          .map((file) => prepareUploadFile(file));

        const totalSize = [...images.map((i) => i.file), ...prepared].reduce(
          (sum, file) => sum + file.size,
          0,
        );
        if (totalSize > MAX_TOTAL_BYTES) {
          showToast(
            `전체 사진 용량은 ${formatMB(MAX_TOTAL_BYTES)}MB 이하만 등록할 수 있어요.`,
            "cancel",
          );
          return;
        }

        const added = prepared.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...added]);
      } catch (error) {
        const message =
          error instanceof ImagePrepareError
            ? error.message
            : "파일을 불러오지 못했어요. 다시 선택해주세요.";
        showToast(message, "cancel");
      }
    },
    [images, showToast],
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      if (!prev[index]) return prev;
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }, []);

  return {
    images,
    addFiles,
    removeImage,
    clearImages,
    hasImages: images.length > 0,
  };
}
