import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button/Button";
import { useToast } from "../../../contexts/ToastContext";
import { diaryApi } from "../api/diary";
import { PATHS } from "../../../constants/path";
import { SUBMIT_LOADING_MESSAGE } from "../../../constants/messages";
import classes from "./DiaryImagePage.module.css";

const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_BYTES = MAX_IMAGES * MAX_FILE_BYTES;
const ACCEPTED_IMAGE_INPUT =
  ".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif";

const UPLOAD_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const HEIC_IMAGE_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);
const EXTENSION_TO_CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

type ImageItem = {
  file: File;
  previewUrl: string;
};

class ImagePrepareError extends Error {}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isHeicImage(file: File) {
  const type = file.type.toLowerCase();
  const extension = getExtension(file.name);
  return HEIC_IMAGE_TYPES.has(type) || extension === "heic" || extension === "heif";
}

function isSupportedUploadImage(file: File) {
  const type = file.type.toLowerCase();
  const extension = getExtension(file.name);
  return UPLOAD_IMAGE_TYPES.has(type) || type === "image/jpg" || extension in EXTENSION_TO_CONTENT_TYPE;
}

function withNormalizedContentType(file: File) {
  const type = file.type.toLowerCase();
  if (UPLOAD_IMAGE_TYPES.has(type)) return file;

  // 모바일 브라우저의 빈 File.type 대응을 위한 확장자 기반 보정
  const extension = getExtension(file.name);
  const normalizedType = EXTENSION_TO_CONTENT_TYPE[extension] ?? (type === "image/jpg" ? "image/jpeg" : "");
  if (!normalizedType) return file;

  return new File([file], file.name, {
    type: normalizedType,
    lastModified: file.lastModified,
  });
}

function formatMB(bytes: number) {
  return Math.ceil(bytes / 1024 / 1024);
}

function prepareImageFile(file: File) {
  // 백엔드 허용 포맷(JPG, PNG, WEBP) 외 iPhone HEIC/HEIF 차단
  if (isHeicImage(file)) {
    throw new ImagePrepareError("HEIC/HEIF 사진은 아직 지원하지 않아요. JPG로 변환한 뒤 다시 올려주세요.");
  }

  if (!isSupportedUploadImage(file)) {
    throw new ImagePrepareError("JPG, PNG, WEBP 사진만 등록할 수 있어요.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new ImagePrepareError(`사진은 장당 ${formatMB(MAX_FILE_BYTES)}MB 이하만 등록할 수 있어요.`);
  }

  return withNormalizedContentType(file);
}

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

function DiaryImagePage() {
  const [images, setImages] = useState<ImageItem[]>([]);
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
        showToast(`사진은 최대 ${MAX_IMAGES}장까지 등록할 수 있어요.`, "cancel");
        return;
      }

      try {
        const toAdd = files.slice(0, remainingSlots);
        const preparedFiles: File[] = [];
        for (const file of toAdd) {
          preparedFiles.push(prepareImageFile(file));
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
            : "사진을 준비하지 못했어요. 다시 선택해주세요.";
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

  const handleSubmit = async () => {
    if (!images.length) {
      showToast("사진을 한 장 이상 선택해주세요.", "cancel");
      return;
    }

    setUploading(true);
    try {
      // 이미지 게시글은 /post-images 한 번으로 파일 업로드와 게시글 생성 처리
      const data = await diaryApi.createImagePost(
        images.map((item) => item.file),
        { type: "MOOMYEONGSO", tags: [] },
      );

      navigate(PATHS.DIARY_SUBMIT_TYPE("today"), {
        replace: true,
        state: {
          type: "today",
          tags: [],
          showCalendar: data.showCalendar,
          streakState: data.showCalendar
            ? {
                calendar: data.calendar,
                coin: data.coin,
                totalPosts: data.totalPosts,
                postId: data.postId,
                tags: [],
              }
            : undefined,
          stayMs: 1600,
          message: SUBMIT_LOADING_MESSAGE,
        },
      });
    } catch {
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
                    alt={`선택된 사진 ${i + 1}`}
                    className={classes.previewImg}
                  />
                  <button
                    type="button"
                    className={classes.removeBtn}
                    onClick={() => handleRemove(i)}
                    disabled={uploading}
                    aria-label="사진 제거"
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
            <li>
              장당 {formatMB(MAX_FILE_BYTES)}MB · 합계 {formatMB(MAX_TOTAL_BYTES)}MB
              이하
            </li>
            <li>JPG, PNG, WEBP</li>
          </ul>
          <Button
            variant="sub"
            onClick={handleSubmit}
            disabled={isEmpty || uploading}
            className={classes.submitBtn}
          >
            {uploading ? "업로드 중..." : "작성완료"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DiaryImagePage;
