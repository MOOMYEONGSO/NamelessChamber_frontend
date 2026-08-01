import {
  useRef,
  forwardRef,
  useImperativeHandle,
  type KeyboardEvent,
} from "react";
import classes from "./PinInput.module.css";

interface PinInputProps {
  value: string;
  onChange: (val: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  "aria-invalid"?: boolean;
  isValid?: boolean;
}

const PinInput = forwardRef<HTMLInputElement, PinInputProps>(
  ({ value, onChange, onKeyDown, "aria-invalid": isInvalid, isValid }, ref) => {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(
      ref,
      () =>
        ({
          focus: () => inputsRef.current[Math.min(value.length, 3)]?.focus(),
        }) as unknown as HTMLInputElement,
    );

    const handleChange = (i: number, val: string) => {
      const char = val.replace(/[^0-9]/g, "").slice(-1);
      const newValArr = value.split("");
      newValArr[i] = char;
      onChange(newValArr.join(""));

      if (char && i < 3) inputsRef.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !value[i] && i > 0) {
        inputsRef.current[i - 1]?.focus();
      }
      onKeyDown?.(e);
    };

    return (
      <div className={classes.wrapper}>
        <div className={classes.container}>
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              className={`${classes.pinBox} ${isInvalid ? classes.error : ""} ${
                isValid ? classes.valid : ""
              }`}
              type="text"
              inputMode="numeric"
              value={value[i] ? "*" : ""}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoComplete="new-password"
            />
          ))}
        </div>
      </div>
    );
  },
);

PinInput.displayName = "PinInput";
export default PinInput;
