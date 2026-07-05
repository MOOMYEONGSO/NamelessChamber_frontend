import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../constants/path";
import Modal from "../../../components/modal/Modal";
import Button from "../../../components/button/Button";
import type { UiType } from "../types/typeMap";

interface Props {
  pendingId: string | null;
  isConfirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  setPendingId: (id: string | null) => void;
  isCoinEmptyOpen: boolean;
  setCoinEmptyOpen: (open: boolean) => void;
  type?: UiType;
}

export default function PostReadModals({
  pendingId,
  isConfirmOpen,
  setConfirmOpen,
  setPendingId,
  isCoinEmptyOpen,
  setCoinEmptyOpen,
  type,
}: Props) {
  const navigate = useNavigate();

  return (
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
            variant="main"
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
            variant="main"
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
  );
}
