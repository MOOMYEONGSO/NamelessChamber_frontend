import { useCallback, useEffect, useState } from "react";

const DRAFT_KEY = "draft:post-write:text";

type DraftFields = Partial<Record<"to" | "body" | "from", string>>;

/**
 * 편지 작성 초안(to/body/from)을 localStorage에 자동 저장/복원한다.
 * 마운트 시 복원, 값 변경 시 디바운스 저장. 제출 성공 후 clearDraft()로 삭제.
 */
export function useLetterDraft() {
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [from, setFrom] = useState("");

  // 복원 (마운트 1회)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as DraftFields;
      if (typeof p.to === "string") setTo(p.to);
      if (typeof p.body === "string") setBody(p.body);
      if (typeof p.from === "string") setFrom(p.from);
    } catch {
      // ignore
    }
  }, []);

  // 자동 저장 (디바운스)
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ to, body, from }));
      } catch {
        // ignore
      }
    }, 350);
    return () => clearTimeout(id);
  }, [to, body, from]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  return { to, setTo, body, setBody, from, setFrom, clearDraft };
}
