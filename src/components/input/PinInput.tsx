import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import classes from "./PinInput.module.css";

interface PinInputProps {
  value: string;
  onChange: (val: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  "aria-invalid"?: boolean;
  isValid?: boolean;
}

const LENGTH = 4;

const PinInput = forwardRef<HTMLInputElement, PinInputProps>(
  ({ value, onChange, onKeyDown, "aria-invalid": isInvalid, isValid }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);

    useImperativeHandle(
      ref,
      () =>
        ({
          focus: () => inputRef.current?.focus(),
          blur: () => inputRef.current?.blur(),
        }) as unknown as HTMLInputElement,
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, LENGTH);
      onChange(digits);
    };

    const activeIndex = Math.min(value.length, LENGTH - 1);

    return (
      <div className={classes.wrapper}>
        <input
          ref={inputRef}
          className={classes.field}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={LENGTH}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={isInvalid}
          aria-label="비밀번호 4자리"
        />

        <div className={classes.boxes} aria-hidden="true">
          {Array.from({ length: LENGTH }, (_, i) => {
            const filled = i < value.length;
            const active = focused && i === activeIndex;
            return (
              <div
                key={i}
                className={[
                  classes.pinBox,
                  isInvalid ? classes.error : "",
                  isValid ? classes.valid : "",
                  active ? classes.active : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {filled ? "*" : ""}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

PinInput.displayName = "PinInput";
export default PinInput;
