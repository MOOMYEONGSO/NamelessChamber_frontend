import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useRandomPosts } from "../hooks/useRandomPosts";
import { isUiType } from "../types/typeMap";
import { PATHS } from "../../../constants/path";
import Card from "../components/card/Card";
import Button from "../../../components/button/Button";
import BottomSheet from "../../../components/bottomSheet/BottomSheet";
import LoadingDots from "../../../components/loading/LoadingDots";
import { TAG_COVER_COLOR } from "../constants/postTags";
import type { PostPreview } from "../types/types";
import home from "./LandingPage.module.css";
import classes from "./PostRerollPage.module.css";

const TITLE = "도착한 편지를 읽어보세요\n당신과 닮은 마음일 수 있어요";

const DECOR_CLASS = [
  home.decor0,
  home.decor1,
  home.decor2,
  home.decor3,
  home.decor4,
];
const EXIT_MS = 320;

// 첫 태그의 커버색, 없으면 흰색(primary-100)
function coverColor(post: PostPreview | undefined): string {
  const tag = post?.tags?.[0];
  return tag ? TAG_COVER_COLOR[tag] : "#fefeff";
}

function PostRerollPage() {
  const { type } = useParams<{ type?: string }>();
  const routeType = type && isUiType(type) ? type : undefined;
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { tags?: string[] } };
  const tags = Array.isArray(state?.tags)
    ? state.tags.filter((t): t is string => typeof t === "string")
    : [];

  // 랜덤 7개 가져오기 (reroll 증가 시 새로 요청)
  const [reroll, setReroll] = useState(0);
  const { data, isLoading, isError, isFetching, refetch } = useRandomPosts(
    7,
    tags,
    reroll,
  );
  const posts = data?.posts ?? [];

  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const animatingRef = useRef(false);
  useEffect(() => {
    setIndex(0);
  }, [data]);

  if (type && !routeType) {
    return <Navigate to={PATHS.POST_ALL} replace />;
  }

  const front = posts[index];

  // 넘기기: 앞 카드가 아래로 빠지고, 뒤 카드(다음 색)가 앞으로 올라옴 (연타 방지)
  const handleSkip = () => {
    if (animatingRef.current || posts.length <= 1) return;
    animatingRef.current = true;
    setExiting(true);
    window.setTimeout(() => {
      setIndex((i) => (i + 1) % posts.length);
      setExiting(false);
      window.setTimeout(() => {
        animatingRef.current = false;
      }, EXIT_MS + 40);
    }, EXIT_MS);
  };
  // 선택하기: 하단 시트에서 열람 확인
  const handleSelect = () => {
    if (front) setConfirmOpen(true);
  };
  const handleConfirmRead = () => {
    if (!front) return;
    setConfirmOpen(false);
    navigate(PATHS.POST_DETAIL_ID(front.postId));
  };
  // 새로 불러오기: 랜덤 7개 새로 받아 처음부터 (중복 탭 방지)
  const handleReload = () => {
    if (isFetching) return;
    setReroll((r) => r + 1);
  };

  return (
    <div className={home.landing}>
      <h1 className={home.title}>{TITLE}</h1>

      <div className={home.stackArea}>
        {isLoading ? (
          <div className={classes.state} aria-live="polite">
            <LoadingDots />
          </div>
        ) : isError || !front ? (
          <div className={classes.state} aria-live="polite">
            <p className={classes.stateMsg}>불러올 수 있는 편지가 없어요.</p>
            <Button
              variant="sub"
              state="active"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              다시 시도
            </Button>
          </div>
        ) : (
          <div className={home.stack}>
            {[4, 3, 2, 1, 0].map((n) => (
              <span
                key={n}
                className={`${home.decor} ${DECOR_CLASS[n]}`}
                style={{
                  // 뒤 스택은 다가올 편지들의 실제 태그 커버색 (순서대로)
                  backgroundColor: coverColor(
                    posts[(index + n + 1) % posts.length],
                  ),
                }}
                aria-hidden="true"
              />
            ))}
            <div
              className={`${home.frontCard} ${classes.deckCard} ${
                exiting ? classes.deckExit : ""
              }`}
            >
              <Card
                to={front.to}
                from={front.from}
                createdAt={front.createdAt}
                contentLength={front.contentLength}
                thumbnailUrl={front.thumbnailUrl}
                tags={front.tags}
              />
            </div>
          </div>
        )}
      </div>

      <div className={classes.actionsWrap}>
        <div className={classes.actions}>
          <Button
            variant="sub"
            state="active"
            className={classes.actionBtn}
            onClick={handleSkip}
            disabled={posts.length <= 1}
          >
            넘기기
          </Button>
          <Button
            variant="main"
            state="active"
            className={classes.actionBtn}
            onClick={handleSelect}
            disabled={!front}
          >
            선택하기
          </Button>
        </div>

        <button
          type="button"
          className={classes.reloadBtn}
          onClick={handleReload}
          disabled={isFetching}
        >
          새로 불러오기
        </button>
      </div>

      <BottomSheet
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="reroll-confirm-title"
      >
        <BottomSheet.Title id="reroll-confirm-title">
          선택하신 편지를 열어볼까요?
        </BottomSheet.Title>
        <BottomSheet.Actions>
          <Button
            type="button"
            variant="main"
            state="active"
            onClick={handleConfirmRead}
          >
            열람하기
          </Button>
          <Button
            type="button"
            variant="sub"
            state="default"
            onClick={() => setConfirmOpen(false)}
          >
            닫기
          </Button>
        </BottomSheet.Actions>
      </BottomSheet>
    </div>
  );
}

export default PostRerollPage;
