import Button from "../../../../components/button/Button";
import Modal from "../../../../components/modal/Modal";
import { POST_TAGS } from "../../constants/postTags";
import type { tags as PostTag } from "../../types/tags";
import TagButton from "./TagButton";
import classes from "./TagSelectModal.module.css";

const MAX_SELECTED_TAGS = 2;

type TagSelectModalProps = {
  isOpen: boolean;
  selectedTags: PostTag[];
  onChange: (tags: PostTag[]) => void;
  onClose: () => void;
  onSubmit: () => void;
  disabled?: boolean;
};

function getNextTags(selectedTags: PostTag[], tag: PostTag): PostTag[] {
  if (selectedTags.includes(tag)) {
    return selectedTags.filter((selectedTag) => selectedTag !== tag);
  }

  if (selectedTags.length < MAX_SELECTED_TAGS) {
    return [...selectedTags, tag];
  }

  const firstTag = selectedTags[0];
  return firstTag ? [firstTag, tag] : [tag];
}

export default function TagSelectModal({
  isOpen,
  selectedTags,
  onChange,
  onClose,
  onSubmit,
  disabled = false,
}: TagSelectModalProps) {
  const handleClose = () => {
    if (!disabled) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Title>작성한 이야기는 어떠한 내용인가요?</Modal.Title>
      <div className={classes.tagContainer}>
        {POST_TAGS.map((option) => (
          <TagButton
            key={option.id}
            id={option.id}
            title={option.title}
            subtitle={option.subtitle}
            image={option.image}
            isSelected={selectedTags.includes(option.id)}
            disabled={disabled}
            onClick={() => onChange(getNextTags(selectedTags, option.id))}
          />
        ))}
      </div>
      <Modal.Actions>
        <Button
          type="button"
          alwaysHoverStyle
          variant="sub"
          state="default"
          onClick={handleClose}
          disabled={disabled}
        >
          닫기
        </Button>
        <Button
          type="button"
          alwaysHoverStyle
          variant="main"
          state={selectedTags.length > 0 ? "active" : "default"}
          disabled={disabled || selectedTags.length === 0}
          className={
            selectedTags.length > 0 ? classes.activeSubmitButton : undefined
          }
          onClick={onSubmit}
        >
          완료하기
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
