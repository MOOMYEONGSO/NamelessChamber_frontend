import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import classes from "./Card.module.css";
import View from "../label/view/View";
import CommentCount from "../label/commentCount/commentcount";
type CardProps = ComponentPropsWithoutRef<"article"> & {
  title: string;
  tags?: string[];
  isAuthor?: boolean;
  views?: number;
  commentCount?: number;
  size?: "sm" | "lg";
};

const LINE_HEIGHT = 32;

const Card = ({
  title,
  isAuthor,
  className,
  tags: tagIds = [],
  views = 0,
  commentCount,
  size = "lg",
  ...props
}: CardProps) => {
  const lineClamp = size === "sm" ? 4 : 6;
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > el.clientHeight);
  }, [title, size]);

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
          {title}
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
