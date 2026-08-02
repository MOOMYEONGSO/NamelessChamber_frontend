export type MsgKey =
  | "email.pattern"
  | "pw.length"
  | "pw.chars"
  | "pw.mixed"
  | "pw.repeat3"
  | "pw.confirm.mismatch"
  | "nickname.required"
  | "nickname.minLength"
  | "nickname.maxLength";

const MESSAGES: Record<MsgKey, string> = {
  "email.pattern": "이메일 양식이 아닙니다.",
  "pw.length": "정확히 4자 입력",
  "pw.chars": "영문 / 숫자(공백 제외)만 허용",
  "pw.mixed": "영문과 숫자를 2개 이상 조합",
  "pw.repeat3": "동일한 숫자 3개 이상 연속 사용 불가",
  "pw.confirm.mismatch": "동일한 비밀번호를 입력",
  "nickname.required": "닉네임을 입력해주세요.",
  "nickname.minLength": "닉네임은 2자 이상 10자 이하로 작성해주세요.",
  "nickname.maxLength": "닉네임은 2자 이상 10자 이하로 작성해주세요.",
};

export function getMsg(key: MsgKey) {
  return MESSAGES[key];
}
