export type SignupLetter = {
  to: string;
  body: string;
  from: string;
};

// 회원가입 완료 편지 (To. … / From … 편지 포맷)
export const getSignupCompleteLetter = (nickname: string): SignupLetter => ({
  to: `처음 만나 반가운 ${nickname}님`,
  body: [
    "안녕하세요, 무명소입니다.",
    "이곳에 도착해주셔서 고맙습니다.",
    "앞으로 남겨주실 편지는 비슷한 마음을 가진",
    "누군가에게 조용히 전달됩니다.",
    "그리고 언젠가,",
    `${nickname}님에게도 닮은 편지가 도착할 거예요.`,
    "", // 문단 사이 빈 줄
    "무엇을 써야 할지 모르겠다면",
    "지금 떠오르는 한 문장부터 시작해도 됩니다.",
    "문장이 정리되지 않아도 됩니다.",
    "천천히 들려주세요.",
  ].join("\n"),
  from: "언제나 곁에서. 무명소 드림.",
});
