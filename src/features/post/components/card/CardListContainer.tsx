import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./CardListContainer.module.css";
import CardSkeleton from "./CardSkeleton";
import CardList from "./CardList";
import type { PostPreview } from "../../types/types";
import Modal from "../../../../components/modal/Modal";
import { PATHS } from "../../../../constants/path";
import Button from "../../../../components/button/Button";
import type { UiType } from "../../types/typeMap";

type InteractionMode = "modal" | "direct";

type Props = {
  posts: PostPreview[];
  coin: number;
  isLoading: boolean;
  isEmpty: boolean;
  type?: UiType;
  emptyMessage: string;
  interactionMode?: InteractionMode;
  onClickCardOverride?: (id: string) => void;
};

const CardListContainer = ({
  posts,
  coin,
  isLoading,
  isEmpty,
  type,
  emptyMessage,
  interactionMode = "modal",
  onClickCardOverride,
}: Props) => {
  const navigate = useNavigate();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isCoinEmptyOpen, setCoinEmptyOpen] = useState(false);

  useEffect(() => {
    if (coin <= 0 && isConfirmOpen) {
      setConfirmOpen(false);
      setPendingId(null);
    }
  }, [coin, isConfirmOpen]);

  const onClickCard = (id: string) => {
    if (onClickCardOverride) {
      onClickCardOverride(id);
      return;
    }
    if (interactionMode === "direct") {
      navigate(PATHS.POST_DETAIL_ID(id));
      return;
    }
    if (coin <= 0) {
      setCoinEmptyOpen(true);
      return;
    }
    setPendingId(id);
    setConfirmOpen(true);
  };

  if (isLoading) {
    return (
      <ul className={classes.cardList}>
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <CardSkeleton />
          </li>
        ))}
      </ul>
    );
  }

  if (isEmpty) {
    return (
      <ul className={classes.cardList}>
        <li className={classes.empty}>{emptyMessage}</li>
      </ul>
    );
  }

  return (
    <>
      <ul className={classes.cardList}>
        <CardList posts={posts} onClickCard={onClickCard} />
      </ul>

      {interactionMode === "modal" && (
        <>
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
                onClick={() => {
                  if (type) {
                    navigate(PATHS.POST_NEW_TYPE(type));
                  } else {
                    navigate(PATHS.HOME);
                  }
                }}
              >
                글 쓰러 가기
              </Button>
            </Modal.Actions>
          </Modal>

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
                  navigate(PATHS.POST_DETAIL_ID(pendingId));
                  setConfirmOpen(false);
                  setPendingId(null);
                }}
              >
                열람하기
              </Button>
            </Modal.Actions>
          </Modal>
        </>
      )}
    </>
  );
};

export default CardListContainer;
