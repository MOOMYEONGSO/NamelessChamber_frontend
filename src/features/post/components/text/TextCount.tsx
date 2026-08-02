import classes from "./TextCount.module.css";

type TextCountProps = {
  count: number;
  reqLength: number;
};

const TextCount = ({ count, reqLength }: TextCountProps) => {
  const text =
    count < reqLength
      ? `${reqLength - count}자 남음`
      : `${count - reqLength}자 넘음`;

  return <div className={classes.textCount}>{text}</div>;
};

export default TextCount;
