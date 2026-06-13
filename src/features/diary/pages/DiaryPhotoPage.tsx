import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button/Button";
import { useToast } from "../../../contexts/ToastContext";
import { diaryApi } from "../api/diary";
import { PATHS } from "../../../constants/path";
import { SUBMIT_LOADING_MESSAGE } from "../../../constants/messages";
import classes from "./DiaryPhotoPage.module.css";

const MAX_IMAGES = 5;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024; // 300MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ACCEPT_ATTR = "image/jpeg,image/png,application/pdf";

type FileItem = {
  file: File;
  previewUrl: string;
  isImage: boolean;
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

function DiaryPhotoPage() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const openPicker = () => fileInputRef.current?.click();

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (!incoming.length) return;

      const invalid = incoming.find((f) => !ACCEPTED_TYPES.includes(f.type));
      if (invalid) {
        showToast("JPG, PNG, PDF 파일만 등록할 수 있어요.", "cancel");
        return;
      }

      const room = MAX_IMAGES - items.length;
      if (room <= 0) {
        showToast(`최대 ${MAX_IMAGES}개까지 등록할 수 있어요.`, "cancel");
        return;
      }

      const added = incoming.slice(0, room).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        isImage: file.type.startsWith("image/"),
      }));
      const next = [...items, ...added];

      const totalSize = next.reduce((sum, item) => sum + item.file.size, 0);
      if (totalSize > MAX_TOTAL_BYTES) {
        added.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        showToast("전체 파일 크기가 300MB를 초과할 수 없어요.", "cancel");
        return;
      }

      setItems(next);
    },
    [items, showToast],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = "";
      addFiles(files);
    },
    [addFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

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

  const handleRemove = useCallback((index: number) => {
    setItems((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSubmit = async () => {
    if (!items.length) {
      showToast("파일을 한 개 이상 선택해주세요.", "cancel");
      return;
    }

    setUploading(true);
    try {
      // 이미지 게시글은 /post-images 한 번으로 파일 업로드와 게시글 생성 처리
      const data = await diaryApi.createImagePost(
        items.map((item) => item.file),
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

  const isEmpty = items.length === 0;

  return (
    <div className={classes.page}>
      <div className={classes.inner}>
        <h1 className={classes.heading}>
          손으로 쓴 편지{" "}
          <span className={classes.count}>
            ({items.length}/{MAX_IMAGES})
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
              {items.map((item, i) => (
                <div key={item.previewUrl} className={classes.previewItem}>
                  {item.isImage ? (
                    <img
                      src={item.previewUrl}
                      alt={`첨부 파일 ${i + 1}`}
                      className={classes.previewImg}
                    />
                  ) : (
                    <div className={classes.pdfPreview}>
                      <span className={classes.pdfBadge}>PDF</span>
                      <span className={classes.pdfName}>{item.file.name}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className={classes.removeBtn}
                    onClick={() => handleRemove(i)}
                    aria-label="파일 제거"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {items.length < MAX_IMAGES && (
                <button
                  type="button"
                  className={classes.addMore}
                  onClick={openPicker}
                  aria-label="파일 추가"
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
          accept={ACCEPT_ATTR}
          multiple
          className={classes.hiddenInput}
          onChange={handleFileChange}
        />

        <div className={classes.footer}>
          <ul className={classes.constraints}>
            <li>합계 300MB 이하</li>
            <li>JPG, PNG, PDF</li>
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

export default DiaryPhotoPage;
