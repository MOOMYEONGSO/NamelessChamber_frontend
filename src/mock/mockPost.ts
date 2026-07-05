export type Post = {
  id: number;
  title: string;
  tags: string[];
  authorType: "self" | "other";
  textCount: number;
};

const mockPosts: Post[] = [
  {
    id: 1,
    title: "나의 고민은 이제 시작이다",
    tags: ["건강", "시간"],
    authorType: "self",
    textCount: 263,
  },
  {
    id: 2,
    title: "나의 고민은 이제 시작이다",
    tags: ["건강", "시간"],
    authorType: "other",
    textCount: 263,
  },
  {
    id: 3,
    title: "나의 고민은 이제 시작이다",
    tags: ["건강", "시간"],
    authorType: "other",
    textCount: 263,
  },
  {
    id: 4,
    title: "나의 고민은 이제 시작이다",
    tags: ["건강", "시간"],
    authorType: "other",
    textCount: 263,
  },
  {
    id: 5,
    title: "나의 고민은 이제 시작이다",
    tags: ["건강", "시간"],
    authorType: "other",
    textCount: 263,
  },
  {
    id: 6,
    title: "나의 고민은 이제 시작이다",
    tags: ["건강", "시간"],
    authorType: "other",
    textCount: 263,
  },
  {
    id: 7,
    title: "나의 고민은 이제 시작이다",
    tags: ["건강", "시간"],
    authorType: "other",
    textCount: 263,
  },
  {
    id: 8,
    title: "나의 고민은 이제 시작이다",
    tags: ["건강", "시간"],
    authorType: "other",
    textCount: 263,
  },
];

export default mockPosts;
