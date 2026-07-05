import Tag from "../label/tag/Tag";
import classes from "./TagList.module.css";
type TagListType = {
  tags: string[];
};

const TagList = ({ tags }: TagListType) => {
  return (
    <div className={classes.tagList}>
      {tags.map((tag, idx) => (
        <Tag key={idx}>{tag}</Tag>
      ))}
    </div>
  );
};

export default TagList;
