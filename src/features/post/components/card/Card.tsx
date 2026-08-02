import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import classes from "./Card.module.css";
import { formatLetterMeta } from "../../../../lib/post/formatLetterMeta";
import { TAG_COVER_COLOR, DARK_COVER_TAGS } from "../../constants/postTags";
import type { tags as PostTag } from "../../types/tags";

type CardProps = ComponentPropsWithoutRef<"article"> & {
  to?: string;
  from?: string;
  createdAt?: string;
  contentLength?: number;
  tags?: PostTag[];
  isAuthor?: boolean;
  thumbnailUrl?: string | null;
  size?: "sm" | "lg";
};

const Card = ({
  to,
  from,
  createdAt,
  contentLength = 0,
  isAuthor,
  className,
  tags: tagIds = [],
  thumbnailUrl,
  size = "lg",
  style,
  ...props
}: CardProps) => {
  const meta = createdAt ? formatLetterMeta(createdAt) : null;
  // 첫 번째 태그로 편지 커버 색상 결정 (없으면 기본 흰색)
  const cover = tagIds.length > 0 ? TAG_COVER_COLOR[tagIds[0]] : undefined;
  const darkCover = tagIds.length > 0 && DARK_COVER_TAGS.includes(tagIds[0]);

  return (
    <article
      className={`${classes.card} ${classes[size]} ${
        isAuthor ? classes.self : classes.other
      } ${className ?? ""}`}
      data-tags={tagIds.join(",")}
      data-cover={darkCover ? "dark" : "light"}
      style={{
        ...(cover ? { backgroundColor: cover } : {}),
        ...(style as CSSProperties),
      }}
      {...props}
    >
      <div className={classes.head}>
        <div className={classes.addr}>
          {to != null && <p className={classes.to}>To. {to}</p>}
          {from != null && <p className={classes.from}>From. {from}</p>}
        </div>
        <img src="/stamp.png" alt="우편물 스티커" className={classes.stamp} />
      </div>

      {thumbnailUrl && (
        <div className={classes.thumb}>
          <img src={thumbnailUrl} alt="사진" className={classes.thumbImg} />
        </div>
      )}

      <div className={classes.meta}>
        <p className={classes.metaRow}>DATE: {meta?.date ?? "----.--.--"}</p>
        <p className={classes.metaRow}>
          WRITING_TIME: {meta?.time ?? "--:-- KST"}
        </p>
        <p className={classes.metaRow}>CHARACTER_COUNT: {contentLength}</p>
      </div>
    </article>
  );
};

export default Card;
