// 편지 카드 메타(작성 날짜/시간)를 Asia/Seoul(KST) 기준으로 포맷합니다.
// createdAt(ISO UTC) → { date: "2026.06.20", time: "23:14 KST" }

const KST = "Asia/Seoul";

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: KST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: KST,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export type LetterMeta = {
  date: string;
  time: string;
};

export function formatLetterMeta(
  createdAt: string | number | Date,
): LetterMeta {
  const d = new Date(createdAt);

  if (Number.isNaN(d.getTime())) {
    return { date: "----.--.--", time: "--:-- KST" };
  }

  // en-CA → "YYYY-MM-DD" → "YYYY.MM.DD"
  const date = dateFmt.format(d).replace(/-/g, ".");
  const time = `${timeFmt.format(d)} KST`;

  return { date, time };
}
