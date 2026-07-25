import { useState } from "react";
import classes from "./TagSelectScreen.module.css";
import { POST_TAGS } from "../../constants/postTags";
import type { tags as PostTag } from "../../types/tags";
import BackArrow from "../../../../assets/icons/BackArrow";

const TITLE = "작성한 편지는\n어떤 주제의 이야기인가요?";

type TagSelectScreenProps = {
  onSubmit: (tag: PostTag) => void;
  onClose: () => void;
  submitting?: boolean;
};

export default function TagSelectScreen({
  onSubmit,
  onClose,
  submitting = false,
}: TagSelectScreenProps) {
  const [selected, setSelected] = useState<PostTag | null>(null);

  return (
    <section className={classes.screen}>
      <header className={classes.top}>
        <button
          type="button"
          className={classes.back}
          onClick={onClose}
          disabled={submitting}
          aria-label="뒤로"
        >
          <BackArrow />
        </button>
        <button
          type="button"
          className={classes.done}
          onClick={() => selected && onSubmit(selected)}
          disabled={!selected || submitting}
        >
          완료
        </button>
      </header>

      <h1 className={classes.title}>{TITLE}</h1>

      <ul className={classes.list}>
        {POST_TAGS.map((tag) => {
          const on = selected === tag.id;
          return (
            <li key={tag.id}>
              <button
                type="button"
                className={`${classes.row} ${on ? classes.on : ""}`}
                onClick={() => setSelected(tag.id)}
                disabled={submitting}
                aria-pressed={on}
              >
                <img src={tag.image} alt="" className={classes.icon} />
                <span className={classes.textGroup}>
                  <span className={classes.tagTitle}>{tag.title}</span>
                  <span className={classes.tagSub}>{tag.subtitle}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
