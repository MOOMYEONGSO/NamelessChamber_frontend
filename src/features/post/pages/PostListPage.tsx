import { useState } from "react";
import { useParams } from "react-router-dom";
import CardListContainer from "../components/card/CardListContainer";
import { usePosts } from "../hooks/usePosts";
import classes from "./PostListPage.module.css";
import { type UiType } from "../types/typeMap";
import { InlineError } from "../../../components/status/InlineStates";
import Paragraph from "../../../components/paragraph/Paragraph";
import { toAppError } from "../../../api/errors";

function PostListPage() {
  const { type } = useParams<{ type?: UiType }>();

  const { data, isLoading, isError, error, refetch } = usePosts({
    type: undefined,
  });

  const [retrying, setRetrying] = useState(false);

  if (isError) {
    const message =
      toAppError(error).message ??
      "문제가 발생했어요. 잠시 후 다시 시도해주세요.";

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
        message={message}
      />
    );
  }

  const posts = data?.posts ?? [];
  const coin = data?.coin ?? 0;
  const isEmpty = !isLoading && posts.length === 0;

  return (
    <div className={classes.list}>
      <div className={classes.guide} role="note" aria-live="polite">
        <Paragraph>하나의 글을 작성하면,</Paragraph>
        <Paragraph>누군가 남긴 하나의 글을 읽을 수 있습니다.</Paragraph>
      </div>

      <CardListContainer
        posts={posts}
        coin={coin}
        isLoading={isLoading}
        isEmpty={isEmpty}
        type={type}
        emptyMessage="아직 등록된 글이 없어요"
      />
    </div>
  );
}

export default PostListPage;
