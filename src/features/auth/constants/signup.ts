export const VISIT_MOTIVES = [
  { value: "COMFORT", label: "위로 받고 싶어요" },
  { value: "PROBLEM", label: "문제를 해결하고 싶어요" },
  { value: "CURIOUS", label: "다른 사람들이 궁금해요" },
  { value: "UNKNOWN", label: "아직 잘 모르겠어요" },
] as const;

export type VisitMotive = (typeof VISIT_MOTIVES)[number]["value"];
