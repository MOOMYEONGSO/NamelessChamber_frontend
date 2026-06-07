import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/button/Button";
import { useToast } from "../../../contexts/ToastContext";
import { diaryApi } from "../api/diary";
import { useCreateDiary } from "../hooks/useCreateDiary";
import { PATHS } from "../../../constants/path";
import { SUBMIT_LOADING_MESSAGE } from "../../../constants/messages";
import classes from "./DiaryPhotoPage.module.css";

const MAX_IMAGES = 5;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024; // 300MB

type ImageItem = {
  file: File;
  previewUrl: string;
};

function DiaryPhotoPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { mutateAsync } = useCreateDiary("TODAY", {
    onSuccess: (data) => {
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
    },
  });

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = "";
      if (!files.length) return;

      const nonImage = files.find((f) => !f.type.startsWith("image/"));
      if (nonImage) {
        showToast("이미지 파일만 등록할 수 있어요.", "cancel");
        return;
      }

      const toAdd = files.slice(0, MAX_IMAGES - images.length);
      const nextImages = [...images, ...toAdd.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))];

      const totalSize = nextImages.reduce((sum, item) => sum + item.file.size, 0);
      if (totalSize > MAX_TOTAL_BYTES) {
        toAdd.forEach((f) => URL.revokeObjectURL(URL.createObjectURL(f)));
        showToast("전체 파일 크기가 300MB를 초과할 수 없어요.", "cancel");
        return;
      }

      setImages(nextImages);
    },
    [images, showToast],
  );

  const handleRemove = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSubmit = async () => {
    if (!images.length) {
      showToast("사진을 한 장 이상 선택해주세요.", "cancel");
      return;
    }

    setUploading(true);
    try {
      const imageIds = await Promise.all(
        images.map((item) => diaryApi.uploadImage(item.file)),
      );

      await mutateAsync({
        title: "",
        content: "",
        tags: [],
        imageIds,
      });
    } catch {
      showToast("사진 업로드에 실패했어요. 다시 시도해주세요.", "cancel");
      setUploading(false);
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.inner}>
        <div className={classes.uploadArea}>
          {images.length === 0 ? (
            <button
              type="button"
              className={classes.emptyPicker}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className={classes.emptyIcon}>＋</span>
              <span className={classes.emptyText}>사진 추가</span>
              <span className={classes.emptyHint}>최대 5장 · 합계 300MB 이하</span>
            </button>
          ) : (
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  ＋
                </button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className={classes.hiddenInput}
            onChange={handleFileChange}
          />
        </div>

        <Button
          variant="main"
          onClick={handleSubmit}
          disabled={images.length === 0 || uploading}
          className={classes.submitBtn}
        >
          {uploading ? "업로드 중..." : "작성 완료"}
        </Button>
      </div>
    </div>
  );
}

export default DiaryPhotoPage;
