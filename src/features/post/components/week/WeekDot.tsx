import Check from "../../../../assets/icons/Check";
import classes from "./WeekDot.module.css";

type WeekDotProps = {
  active: boolean;
  label: string;
};

function WeekDot({ active, label }: WeekDotProps) {
  return (
    <div
      role="listitem"
      className={`${classes.dot} ${active ? classes.active : ""}`}
      title={`${label}요일 ${active ? "작성함" : "미작성"}`}
    >
      {active && (
        <span className={classes.checkMark}>
          <Check />
        </span>
      )}
    </div>
  );
}

export default WeekDot;
