import React, { useState, useEffect, useRef, useCallback } from "react";
import Card from "../components/card/Card";
import classes from "./AllPostsFeedPage.module.css";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../constants/path";
import { useInfiniteQuery } from "@tanstack/react-query";
import { diaryApi } from "../api/diary";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/button/Button";

const CELL_W = 380;
const CELL_H = 380;

const cardSizeFromId = (id: string): "sm" | "lg" =>
  id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 2 === 0
    ? "sm"
    : "lg";
const PREFETCH_RINGS = 2; // 최외곽 링에서 N링 이내 접근 시 다음 페이지 선제 로드

// (col, row) 좌표를 생성하는 바둑판 스파이럴(Spiral) 알고리즘
const getGridCoordinates = (index: number) => {
  let x = 0,
    y = 0,
    dx = 0,
    dy = -1;
  for (let i = 0; i < index; i++) {
    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      const t = dx;
      dx = -dy;
      dy = t;
    }
    x += dx;
    y += dy;
  }
  return { col: x, row: y };
};

// 선형 보간 함수 (GSAP처럼 부드러운 움직임을 만들기 위함)
const lerp = (start: number, end: number, factor: number) =>
  start + (end - start) * factor;

const AllPostsFeedPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // React Query를 활용한 무한 스크롤(커서) 데이터 페칭
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["posts", "all", "canvas"],
      queryFn: ({ pageParam = null }: { pageParam?: string | null }) =>
        diaryApi.getAll(undefined, pageParam, 20),
      getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
      initialPageParam: null as string | null,
    });

  // 받아온 2차원 페이지 배열을 1차원 배열로 평탄화(Flatten)
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];
  const coin = data?.pages[0]?.coin ?? 0;

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isCoinEmptyOpen, setCoinEmptyOpen] = useState(false);

  useEffect(() => {
    if (coin <= 0 && isConfirmOpen) {
      setConfirmOpen(false);
      setPendingId(null);
    }
  }, [coin, isConfirmOpen]);

  // setTarget의 clamp 계산에서 최신 값 접근을 위한 Refs
  const postsCountRef = useRef(0);
  const hasNextPageRef = useRef(false);
  hasNextPageRef.current = !!hasNextPage;
  postsCountRef.current = posts.length;

  // 뷰포트 링 추적 (데이터 페칭 트리거용)
  const [viewportRing, setViewportRing] = useState(0);
  const lastRingRef = useRef(0);

  // 무한 캔버스 카메라 위치 (가상 좌표)
  const target = useRef({ x: 0, y: 0 }); // 목표 위치
  const current = useRef({ x: 0, y: 0 }); // 현재 렌더링 위치 (부드럽게 목표를 따라감)
  const isAnimating = useRef(false);

  // 드래그 상태 관리
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  // 화면에 렌더링할 그리드 범위 (가상화)
  const [range, setRange] = useState({
    minCol: -2,
    maxCol: 2,
    minRow: -2,
    maxRow: 2,
  });

  const updateRange = useCallback(
    (x: number, y: number) => {
      const viewW = containerRef.current?.clientWidth ?? window.innerWidth;
      const viewH = containerRef.current?.clientHeight ?? window.innerHeight;

      // 현재 보여지는 화면 + 양옆 위아래로 1칸씩 여유분을 렌더링 범위로 잡음
      const minCol = Math.floor(x / CELL_W) - 1;
      const maxCol = Math.floor((x + viewW) / CELL_W) + 1;
      const minRow = Math.floor(y / CELL_H) - 1;
      const maxRow = Math.floor((y + viewH) / CELL_H) + 1;

      setRange((prev) => {
        if (
          prev.minCol === minCol &&
          prev.maxCol === maxCol &&
          prev.minRow === minRow &&
          prev.maxRow === maxRow
        ) {
          return prev;
        }
        return { minCol, maxCol, minRow, maxRow };
      });

    },
    [],
  );

  const tick = useCallback(() => {
    // Lerp를 통해 부드러운 애니메이션 구현
    current.current.x = lerp(current.current.x, target.current.x, 0.1);
    current.current.y = lerp(current.current.y, target.current.y, 0.1);

    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${-current.current.x}px, ${-current.current.y}px)`;
    }
    if (containerRef.current) {
      containerRef.current.style.backgroundPosition = `${-current.current.x}px ${-current.current.y}px`;
    }

    updateRange(current.current.x, current.current.y);

    // 뷰포트 링 감지 — 링 경계를 넘을 때만 state 업데이트 (rAF 매 프레임 setState 방지)
    const ringNow = Math.max(
      Math.abs(Math.round(current.current.x / CELL_W)),
      Math.abs(Math.round(current.current.y / CELL_H)),
    );
    if (ringNow !== lastRingRef.current) {
      lastRingRef.current = ringNow;
      setViewportRing(ringNow);
    }

    // 목표지점에 거의 도달하면 애니메이션 중지
    if (
      Math.abs(target.current.x - current.current.x) > 0.5 ||
      Math.abs(target.current.y - current.current.y) > 0.5
    ) {
      requestAnimationFrame(tick);
    } else {
      isAnimating.current = false;
    }
  }, [updateRange]);

  const setTarget = useCallback(
    (x: number, y: number) => {
      let nextX = x;
      let nextY = y;

      // 더 이상 불러올 카드가 없을 때 캔버스 밖으로 스크롤되는 것을 제한(Clamp)
      if (!hasNextPageRef.current && postsCountRef.current > 0) {
        const viewW = containerRef.current?.clientWidth ?? window.innerWidth;
        const viewH = containerRef.current?.clientHeight ?? window.innerHeight;

        // 현재 배치된 카드들의 가장 바깥쪽 반경(Radius) 계산
        const maxR = Math.ceil((Math.sqrt(postsCountRef.current) - 1) / 2);
        const maxRadiusX = maxR * CELL_W;
        const maxRadiusY = maxR * CELL_H;

        // 현재 뷰포트의 중앙 좌표 계산 (0,0 카드의 중심을 기준으로 보정)
        let cx = nextX + viewW / 2 - CELL_W / 2;
        let cy = nextY + viewH / 2 - CELL_H / 2;

        // 캔버스의 끝을 벗어나지 않도록 중앙 좌표를 제한
        cx = Math.max(-maxRadiusX, Math.min(maxRadiusX, cx));
        cy = Math.max(-maxRadiusY, Math.min(maxRadiusY, cy));

        // 제한된 중앙 좌표를 다시 좌상단 타겟 좌표로 변환
        nextX = cx - viewW / 2 + CELL_W / 2;
        nextY = cy - viewH / 2 + CELL_H / 2;
      }

      target.current.x = nextX;
      target.current.y = nextY;
      if (!isAnimating.current) {
        isAnimating.current = true;
        requestAnimationFrame(tick);
      }
    },
    [tick],
  );

  useEffect(() => {
    // 초기 중앙 정렬 (카드가 화면 중앙에 오도록)
    const containerW = containerRef.current?.clientWidth ?? window.innerWidth;
    const containerH = containerRef.current?.clientHeight ?? window.innerHeight;
    const startX = -(containerW / 2) + CELL_W / 2;
    const startY = -(containerH / 2) + CELL_H / 2;
    setTarget(startX, startY);

    // 트랙패드/마우스 휠 패닝 이벤트
    const el = containerRef.current;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // 브라우저 기본 스크롤 방지
      setTarget(target.current.x + e.deltaX, target.current.y + e.deltaY);
    };
    el?.addEventListener("wheel", handleWheel, { passive: false });
    return () => el?.removeEventListener("wheel", handleWheel);
  }, [setTarget]);

  // 데이터 페칭 트리거 — 뷰포트 링이 최외곽 링에 가까워지면 다음 페이지 요청
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const outerRing = Math.max(0, Math.floor((Math.sqrt(posts.length) - 1) / 2));
    if (outerRing - viewportRing <= PREFETCH_RINGS) {
      fetchNextPage();
    }
  }, [viewportRing, hasNextPage, isFetchingNextPage, posts.length, fetchNextPage]);

  // 처음(중앙) 위치로 돌아오는 핸들러
  const handleReturnToCenter = useCallback(() => {
    const containerW = containerRef.current?.clientWidth ?? window.innerWidth;
    const containerH = containerRef.current?.clientHeight ?? window.innerHeight;
    const startX = -(containerW / 2) + CELL_W / 2;
    const startY = -(containerH / 2) + CELL_H / 2;
    setTarget(startX, startY);
  }, [setTarget]);

  // --- 드래그 이벤트 핸들러 ---
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    dragStartPos.current = { x: e.clientX, y: e.clientY }; // 클릭 시작 위치 저장
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setTarget(target.current.x - dx, target.current.y - dy);
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  // 범위 내의 카드들만 필터링하여 렌더링 (2D 가상화)
  const visiblePosts = posts
    .map((post, index) => {
      const { col, row } = getGridCoordinates(index);
      return { post, col, row };
    })
    .filter(
      ({ col, row }) =>
        col >= range.minCol &&
        col <= range.maxCol &&
        row >= range.minRow &&
        row <= range.maxRow,
    );

  return (
    <>
      <div
        className={classes.container}
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        onDragStart={(e) => e.preventDefault()} // 브라우저 기본 드래그(잔상)가 이벤트를 삼키는 것 원천 차단
      >
        <div className={classes.canvas} ref={canvasRef}>
          {visiblePosts.map(({ post, col, row }) => (
            <div
              key={post.postId}
              className={classes.cardWrapper}
              style={{ left: col * CELL_W, top: row * CELL_H }}
              onClickCapture={(e) => {
                // 마우스를 드래그(패닝) 중일 때는 카드가 클릭되지 않도록 방어
                const dx = Math.abs(e.clientX - dragStartPos.current.x);
                const dy = Math.abs(e.clientY - dragStartPos.current.y);
                const isDraggingMove = dx > 5 || dy > 5;

                if (isDraggingMove) {
                  e.stopPropagation();
                  e.preventDefault();
                } else {
                  if (coin <= 0) {
                    setCoinEmptyOpen(true);
                  } else {
                    setPendingId(post.postId);
                    setConfirmOpen(true);
                  }
                }
              }}
            >
              <Card
                contentPreview={post.contentPreview ?? ""}
                tags={post.tags}
                views={post.views}
                commentCount={post.commentCount}
                thumbnailUrl={post.thumbnailUrl}

                isAuthor={false}
                size={cardSizeFromId(post.postId)}
              />
            </div>
          ))}
        </div>
        {isLoading && (
          <div className={classes.loadingBadge}>새로운 이야기 발견 중...</div>
        )}
        <button
          className={classes.returnButton}
          onClick={handleReturnToCenter}
          onPointerDown={(e) => e.stopPropagation()} // 드래그 이벤트 버블링 방지
        >
          처음으로
        </button>
      </div>

      {/* 열람권 부족 모달 */}
      <Modal
        isOpen={isCoinEmptyOpen}
        onClose={() => setCoinEmptyOpen(false)}
        aria-labelledby="coin-title"
      >
        <Modal.Title id="coin-title">
          <>
            열람 가능한 횟수가 없어요.
            <br />
            당신의 이야기를 남기면 다른 사람의 고백 한 편이 열립니다.
          </>
        </Modal.Title>
        <Modal.Actions>
          <Button
            type="button"
            alwaysHoverStyle
            variant="sub"
            state="default"
            onClick={() => setCoinEmptyOpen(false)}
          >
            취소하기
          </Button>
          <Button
            type="button"
            alwaysHoverStyle
            variant="main"
            state="default"
            onClick={() => navigate(PATHS.HOME)}
          >
            글 쓰러 가기
          </Button>
        </Modal.Actions>
      </Modal>

      {/* 열람권 사용 확인 모달 */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingId(null);
        }}
        aria-labelledby="preview-title"
      >
        <Modal.Title id="preview-title">
          <>
            열람권 1개를 이 글을 여는 데 사용합니다.
            <br />한 번 열린 기록은 언제든 다시 읽을 수 있습니다.
          </>
        </Modal.Title>
        <Modal.Actions>
          <Button
            type="button"
            alwaysHoverStyle
            variant="sub"
            state="default"
            onClick={() => {
              setConfirmOpen(false);
              setPendingId(null);
            }}
          >
            취소하기
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!pendingId) return;
              navigate(PATHS.DIARY_DETAIL_ID(pendingId));
              setConfirmOpen(false);
              setPendingId(null);
            }}
          >
            열람하기
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default AllPostsFeedPage;
