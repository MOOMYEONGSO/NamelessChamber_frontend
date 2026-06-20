import imageCompression from "browser-image-compression";

export const MAX_IMAGES = 5;
export const MAX_TOTAL_BYTES = 300 * 1024 * 1024;

export const ACCEPTED_IMAGE_INPUT =
  ".jpg,.jpeg,.png,.pdf,.heic,.heif,image/jpeg,image/png,application/pdf,image/heic,image/heif";

// 업로드 전 클라이언트 압축
const COMPRESS_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

const PDF_TYPE = "application/pdf";
const UPLOAD_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
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
};

export class ImagePrepareError extends Error {}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isHeicImage(file: File) {
  const type = file.type.toLowerCase();
  const extension = getExtension(file.name);
  return (
    HEIC_IMAGE_TYPES.has(type) || extension === "heic" || extension === "heif"
  );
}

export function isPdf(file: File) {
  return (
    file.type.toLowerCase() === PDF_TYPE || getExtension(file.name) === "pdf"
  );
}

function isSupportedFile(file: File) {
  if (isPdf(file)) return true;
  const type = file.type.toLowerCase();
  const extension = getExtension(file.name);
  return (
    UPLOAD_IMAGE_TYPES.has(type) ||
    type === "image/jpg" ||
    extension in EXTENSION_TO_CONTENT_TYPE
  );
}

function withNormalizedContentType(file: File) {
  const type = file.type.toLowerCase();
  if (isPdf(file) || UPLOAD_IMAGE_TYPES.has(type)) return file;

  // 모바일 브라우저의 빈 File.type 대응을 위한 확장자 기반 보정
  const extension = getExtension(file.name);
  const normalizedType =
    EXTENSION_TO_CONTENT_TYPE[extension] ??
    (type === "image/jpg" ? "image/jpeg" : "");
  if (!normalizedType) return file;

  return new File([file], file.name, {
    type: normalizedType,
    lastModified: file.lastModified,
  });
}

export function formatMB(bytes: number) {
  return Math.ceil(bytes / 1024 / 1024);
}

/**
 * 업로드 가능한 파일인지 검증하고 content-type을 정규화한다.
 * - HEIC/HEIF: 차단(안내)
 * - JPG/PNG/PDF만 허용
 * - 장당 크기 제한 없음(업로드 직전 압축으로 처리)
 */
export function prepareUploadFile(file: File): File {
  if (isHeicImage(file)) {
    throw new ImagePrepareError(
      "HEIC/HEIF 사진은 아직 지원하지 않아요. JPG로 변환한 뒤 다시 올려주세요.",
    );
  }

  if (!isSupportedFile(file)) {
    throw new ImagePrepareError("JPG, PNG, PDF 파일만 등록할 수 있어요.");
  }

  return withNormalizedContentType(file);
}

/**
 * 업로드 직전 변환: 이미지는 압축(EXIF 회전 보정), PDF는 그대로 반환.
 */
export function compressForUpload(file: File): Promise<File> {
  if (isPdf(file)) return Promise.resolve(file);
  return imageCompression(file, COMPRESS_OPTIONS);
}
