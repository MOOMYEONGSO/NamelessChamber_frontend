import type { tags } from "../types/tags";
import iconPeople from "../../../assets/tags/people-icon.png";
import iconThoughts from "../../../assets/tags/thoughts-icon.png";
import iconHappy from "../../../assets/tags/happy-icon.png";
import iconFriends from "../../../assets/tags/friends-icon.png";
import iconGratitude from "../../../assets/tags/gratitude-icon.png";
import iconOther from "../../../assets/tags/other-icon.png";

import iconTime from "../../../assets/tags/time-icon.png";

export const CARD_TAG_LABEL: Record<tags, string> = {
  PEOPLE: "사람",
  FRIENDSHIP: "친구",
  THOUGHTS: "생각",
  HAPPY: "행복",
  GRATITUDE: "감사",
  TIME: "시간",
  OTHER: "",
};

export const POST_TAGS = [
  {
    id: "PEOPLE",
    title: "사람에 대하여",
    subtitle: "어떤 사람 하나로 하루가 달라질 때가 있어요",
    image: iconPeople,
  },
  {
    id: "FRIENDSHIP",
    title: "친구 관계",
    subtitle: "가까운 만큼, 말하지 못할 때가 있죠",
    image: iconFriends,
  },
  {
    id: "THOUGHTS",
    title: "생각이 깊어진",
    subtitle: "오늘 따라 생각이 깊어지군요",
    image: iconThoughts,
  },
  {
    id: "HAPPY",
    title: "행복한 이야기",
    subtitle: "특별하지 않아도, 기억하고 싶은 순간이에요",
    image: iconHappy,
  },
  {
    id: "GRATITUDE",
    title: "감사한 사람에게",
    subtitle: "저와 함께 해주셔서 감사해요",
    image: iconGratitude,
  },
  {
    id: "TIME",
    title: "흘러가는 시간",
    subtitle: "지나고 나서 후회하지 않도록 해요",
    image: iconTime,
  },
  {
    id: "OTHER",
    title: "정하기 어려워요",
    subtitle: "딱 잘라 말하기 어렵네요",
    image: iconOther,
  },
] as const satisfies ReadonlyArray<{
  id: tags;
  title: string;
  subtitle: string;
  image: string;
}>;
