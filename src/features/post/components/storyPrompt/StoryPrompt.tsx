import { Link } from "react-router-dom";
import Paragraph from "../../../../components/paragraph/Paragraph";
import Button from "../../../../components/button/Button";
import classes from "./StoryPrompt.module.css";

type StoryPromptProps = {
  lines: [string, string];
  to: string;
  buttonLabel?: string;
  paddingSize?: "large" | "small";
};

export default function StoryPrompt({
  lines,
  to,
  buttonLabel = "한 번 더 흘려보내기",
  paddingSize = "small",
}: StoryPromptProps) {
  return (
    <div
      className={classes.closing}
      style={{ padding: paddingSize === "large" ? "8rem 0" : "4rem 0" }}
    >
      <div>
        <Paragraph>{lines[0]}</Paragraph>
        <Paragraph>{lines[1]}</Paragraph>
      </div>
      <Link to={to} className={classes.link}>
        <Button>{buttonLabel}</Button>
      </Link>
    </div>
  );
}
