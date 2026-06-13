import FadeInOnView from "../../../diary/components/FadeInOnView";
import Paragraph from "../../../../components/paragraph/Paragraph";
import classes from "../../../diary/pages/DiaryDetailPage.module.css";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { InlineError } from "../../../../components/status/InlineStates";
import { formatDiaryTime } from "../../../../lib/diary/formatDiaryTime";
import { useAdminDiary } from "../../hooks/useAdminDiary";
import { toAppError } from "../../../../api/errors";
import Button from "../../../../components/button/Button";
import Modal from "../../../../components/modal/Modal";
import { PATHS } from "../../../../constants/path";
import { useAdminDiaryDelete } from "../../hooks/useAdminDiaryDelete";

function DetailContent({
  content,
  isLoading,
  createdLabel,
  actions,
}: {
  content?: string;
  isLoading: boolean;
  createdLabel?: string;
  actions?: ReactNode;
}) {
  const paragraphs = useMemo(() => {
    const trimmed = content?.trim();
    return trimmed ? trimmed.split(/\n{2,}/g) : [];
  }, [content]);

  return (
    <section className={`${classes.diary} ${classes.detail}`}>
      {createdLabel && (
        <Paragraph className={classes.intro}>{createdLabel}</Paragraph>
      )}

      <div className={classes.lines} aria-busy={isLoading}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={classes.paragraphSkeleton} />
          ))
        ) : paragraphs.length > 0 ? (
          paragraphs.map((p, i) => (
            <FadeInOnView key={i} className={classes.paragraph} once>
              {p}
            </FadeInOnView>
          ))
        ) : (
          <div className={classes.empty}>아직 내용이 없습니다.</div>
        )}
      </div>

      {actions}
    </section>
  );
}

export default function AdminDiaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useAdminDiary(id);
  const [retrying, setRetrying] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useAdminDiaryDelete();

  if (!id) return <Navigate to={PATHS.ADMIN_DIARIES} replace />;

  if (isError) {
    return (
      <InlineError
        isLoading={retrying}
        onRetry={async () => {
          try {
            setRetrying(true);
            await refetch();
          } finally {
            setRetrying(false);
          }
        }}
        message={
          toAppError(error).message ??
          "문제가 발생했어요. 잠시 후 다시 시도해주세요."
        }
      />
    );
  }

  const createdLabel =
    data?.createdAt && !isLoading ? formatDiaryTime(data.createdAt) : undefined;

  return (
    <>
      <DetailContent
        content={data?.content}
        isLoading={isLoading}
        createdLabel={createdLabel}
        actions={
          <div className={classes.buttonContainer}>
            <Button
              type="button"
              alwaysHoverStyle
              variant="main"
              state="default"
              onClick={() => setDeleteOpen(true)}
              disabled={deleteMutation.isPending}>
              삭제
            </Button>
          </div>
        }
      />

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (deleteMutation.isPending) return;
          setDeleteOpen(false);
        }}
        aria-labelledby="admin-delete-title"
      >
        <Modal.Title id="admin-delete-title">
          이 게시글을 삭제할까요?
        </Modal.Title>
        <Modal.Actions>
          <Button
            type="button"
            alwaysHoverStyle
            variant="sub"
            state="default"
            onClick={() => setDeleteOpen(false)}
            disabled={deleteMutation.isPending}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!id) return;
              deleteMutation.mutate(id, {
                onSuccess: () => {
                  setDeleteOpen(false);
                  navigate(PATHS.ADMIN_DIARIES, { replace: true });
                },
              });
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "삭제 중…" : "삭제"}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}