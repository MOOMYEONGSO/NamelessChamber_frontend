import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import classes from "./Card.module.css";
import View from "../label/view/View";
import CommentCount from "../label/commentCount/commentcount";

type CardProps = ComponentPropsWithoutRef<"article"> & {
  contentPreview: string;
  tags?: string[];
  isAuthor?: boolean;
  views?: number;
  commentCount?: number;
  thumbnailUrl?: string | null;
  size?: "sm" | "lg";
};

// CSS --card-line(28px)과 반드시 동일하게 유지 (줄노트 줄 높이)
const LINE_HEIGHT = 28;

const Card = ({
  contentPreview,
  isAuthor,
  className,
  tags: tagIds = [],
  views = 0,
  commentCount,
  thumbnailUrl,
  size = "lg",
  ...props
}: CardProps) => {
  const isPhoto = !!thumbnailUrl;
  const lineClamp = size === "sm" ? 4 : 6;
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    if (isPhoto) return;
    const el = titleRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > el.clientHeight);
  }, [contentPreview, size, isPhoto]);

  if (isPhoto) {
    return (
      <article
        className={`${classes.photoCard} ${className ?? ""}`}
        data-tags={tagIds.join(",")}
        {...props}
      >
        <div className={classes.photoGrid}>
          <img
            src={thumbnailUrl ?? ""}
            alt="사진"
            className={classes.photoImg}
          />
        </div>
        <div className={classes.photoFooter}>
          {commentCount !== undefined && commentCount > 0 && (
            <CommentCount>{commentCount}</CommentCount>
          )}
          <View>{views}</View>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`${classes.card} ${classes[size]} ${isAuthor ? classes.self : classes.other} ${className ?? ""}`}
      data-tags={tagIds.join(",")}
      {...props}
    >
      <div className={`${classes.tape} ${isAuthor ? classes.tapeAuthor : ""}`} />
      <div className={classes.content}>
        <p
          ref={titleRef}
          className={classes.title}
          style={{ maxHeight: LINE_HEIGHT * lineClamp }}
        >
          {contentPreview}
        </p>
        {isClamped && <span className={classes.readMore}>...자세히 보기</span>}
      </div>
      <div className={classes.footer}>
        <div className={classes.metaRight}>
          {commentCount !== undefined && commentCount > 0 && (
            <CommentCount>{commentCount}</CommentCount>
          )}
          <View>{views}</View>
        </div>
      </div>
    </article>
  );
};

export default Card;
