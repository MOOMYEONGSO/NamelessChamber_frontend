import Button from "../../../components/button/Button";
import classes from "./MotiveOption.module.css";

type MotiveOptionProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

const MotiveOption = ({ label, selected, onSelect }: MotiveOptionProps) => {
  return (
    <Button
      type="button"
      variant={selected ? "main" : "sub"}
      state="active"
      onClick={onSelect}
      aria-pressed={selected}
      className={classes.option}
    >
      <span className={classes.inner}>
        <svg
          className={classes.check}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 12.5l5 5L20 6.5" />
        </svg>
        <span>{label}</span>
      </span>
    </Button>
  );
};

export default MotiveOption;
