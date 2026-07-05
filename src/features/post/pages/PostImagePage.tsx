import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button/Button";
import { useToast } from "../../../contexts/ToastContext";
import { postApi } from "../api/post";
import { PATHS } from "../../../constants/path";
import { SUBMIT_LOADING_MESSAGE } from "../../../constants/messages";
import type { tags as PostTag } from "../types/tags";
import TagSelectModal from "../components/tag/TagSelectModal";
import {
  MAX_IMAGES,
  MAX_TOTAL_BYTES,
  ACCEPTED_IMAGE_INPUT,
  ImagePrepareError,
  prepareUploadFile,
  formatMB,
  compressForUpload,
} from "../utils/imageUpload";
import classes from "./PostImagePage.module.css";

type ImageItem = {
  file: File;
  previewUrl: string;
};

function CloudIcon() {
  return (
    <svg
      className={classes.cloudIcon}
      viewBox="0 0 64 44"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M49 42H17C8.72 42 2 35.28 2 27c0-7.86 6.05-14.3 13.75-14.94C18.3 5.02 24.6 0 32 0c8.97 0 16.34 6.78 17.36 15.49C57.5 16.6 62 21 62 26.5 62 35.06 55.06 42 49 42Z"
        fill="currentColor"
      />
      <path
        d="M32 33V20m0 0-5 5m5-5 5 5"
        stroke="var(--color-primary-100)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PostImagePage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [tags, setTags] = useState<PostTag[]>([]);
  const [showTagSelect, setShowTagSelect] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<ImageItem[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // 페이지 이탈 시 남은 미리보기 URL 정리를 위한 최신 목록 보관
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      // 모바일 대용량 사진의 브라우저 메모리 점유를 줄이기 위한 Object URL 해제
      imagesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const openPicker = () => fileInputRef.current?.click();

  const addFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return;
      if (uploading) return;

      const remainingSlots = MAX_IMAGES - images.length;
      if (remainingSlots <= 0) {
        showToast(
          `사진은 최대 ${MAX_IMAGES}장까지 등록할 수 있어요.`,
          "cancel",
        );
        return;
      }

      try {
        const toAdd = files.slice(0, remainingSlots);
        const preparedFiles: File[] = [];
        for (const file of toAdd) {
          preparedFiles.push(prepareUploadFile(file));
        }

        const totalSize = [
          ...images.map((item) => item.file),
          ...preparedFiles,
        ].reduce((sum, file) => sum + file.size, 0);
        if (totalSize > MAX_TOTAL_BYTES) {
          showToast(
            `전체 사진 용량은 ${formatMB(MAX_TOTAL_BYTES)}MB 이하만 등록할 수 있어요.`,
            "cancel",
          );
          return;
        }

        setImages((prev) => [
          ...prev,
          ...preparedFiles.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
          })),
        ]);
      } catch (error) {
        const message =
          error instanceof ImagePrepareError
            ? error.message
            : "파일을 불러오지 못했어요. 다시 선택해주세요.";
        showToast(message, "cancel");
      }
    },
    [images, showToast, uploading],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = "";
      addFiles(files);
    },
    [addFiles],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (uploading) return;
      setIsDragging(true);
    },
    [uploading],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(Array.from(e.dataTransfer.files ?? []));
    },
    [addFiles],
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (uploading) return;

      setImages((prev) => {
        if (!prev[index]) return prev;

        URL.revokeObjectURL(prev[index].previewUrl);
        return prev.filter((_, i) => i !== index);
      });
    },
    [uploading],
  );

  const handleOpenTagSelect = () => {
    if (!images.length) {
      showToast("사진을 한 장 이상 선택해주세요.", "cancel");
      return;
    }
    setShowTagSelect(true);
  };

  const handleSubmit = async () => {
    if (uploading) return;

    if (!images.length) {
      showToast("사진을 한 장 이상 선택해주세요.", "cancel");
      return;
    }

    if (!tags.length) {
      showToast("태그를 하나 이상 선택해주세요.", "info");
      return;
    }

    setUploading(true);
    try {
      // 업로드 전 이미지는 압축해 서버 용량 한도에 맞춘다.
      const compressedFiles = await Promise.all(
        images.map((item) => compressForUpload(item.file)),
      );

      // 이미지 게시글은 /post-images 한 번으로 파일 업로드와 게시글 생성 처리
      const data = await postApi.createImagePost(compressedFiles, {
        tags,
      });

      setShowTagSelect(false);
      navigate(PATHS.POST_SUBMIT_TYPE("public"), {
        replace: true,
        state: {
          type: "public",
          tags,
          showCalendar: data.showCalendar && !!data.calendar,
          streakState: data.showCalendar && data.calendar
            ? {
                calendar: data.calendar,
                coin: data.coin,
                totalPosts: data.totalPosts,
                postId: data.postId,
                tags,
              }
            : undefined,
          stayMs: 1600,
          message: SUBMIT_LOADING_MESSAGE,
        },
      });
    } catch (error) {
      console.error("이미지 게시글 작성 실패:", error);
      showToast("사진 업로드에 실패했어요. 다시 시도해주세요.", "cancel");
      setUploading(false);
    }
  };

  const isEmpty = images.length === 0;

  return (
    <div className={classes.page}>
      <div className={classes.inner}>
        <h1 className={classes.heading}>
          손으로 쓴 편지{" "}
          <span className={classes.count}>
            ({images.length}/{MAX_IMAGES})
          </span>
        </h1>

        {isEmpty ? (
          <button
            type="button"
            className={`${classes.dropzone} ${isDragging ? classes.dragging : ""}`}
            onClick={openPicker}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            disabled={uploading}
          >
            <div className={classes.dropInner}>
              <CloudIcon />
              <p className={classes.dropTitle}>
                이곳을 클릭하거나 파일을 마우스로 끌어 오세요
              </p>
              <span className={classes.browseBtn}>찾아보기</span>
              <p className={classes.dropHint}>
                또는 파일을 드래그하여 업로드하세요.
              </p>
            </div>
          </button>
        ) : (
          <div
            className={`${classes.dropzoneFilled} ${isDragging ? classes.dragging : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={classes.previewGrid}>
              {images.map((item, i) => (
                <div key={item.previewUrl} className={classes.previewItem}>
                  <img
                    src={item.previewUrl}
                    alt={`선택된 파일 ${i + 1}`}
                    className={classes.previewImg}
                  />
                  <button
                    type="button"
                    className={classes.removeBtn}
                    onClick={() => handleRemove(i)}
                    disabled={uploading}
                    aria-label="파일 제거"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  className={classes.addMore}
                  onClick={openPicker}
                  disabled={uploading}
                  aria-label="사진 추가"
                >
                  ＋
                </button>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_INPUT}
          multiple
          disabled={uploading}
          className={classes.hiddenInput}
          onChange={handleFileChange}
        />

        <div className={classes.footer}>
          <ul className={classes.constraints}>
            <li>합계 {formatMB(MAX_TOTAL_BYTES)}MB 이하</li>
            <li>JPG, PNG, WEBP</li>
          </ul>
          <Button
            variant="sub"
            onClick={handleOpenTagSelect}
            disabled={isEmpty || uploading}
            className={classes.submitBtn}
          >
            {uploading ? "업로드 중..." : "작성완료"}
          </Button>
        </div>
      </div>

      <TagSelectModal
        isOpen={showTagSelect}
        selectedTags={tags}
        onChange={setTags}
        onClose={() => setShowTagSelect(false)}
        onSubmit={() => void handleSubmit()}
        disabled={uploading}
      />
    </div>
  );
}

export default PostImagePage;
