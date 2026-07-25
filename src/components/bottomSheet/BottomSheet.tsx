import {
  useEffect,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import ReactDOM from "react-dom";
import classes from "./BottomSheet.module.css";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const BaseBottomSheet = ({
  isOpen,
  onClose,
  children,
  ...rest
}: BottomSheetProps) => {
  // ESC 키로 닫기 (열려 있을 때만 리스너 등록)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={classes.overlay} onClick={onClose}>
      <div
        className={classes.sheet}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        {...rest}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

/* ===== 서브컴포넌트 ===== */
type TitleProps = HTMLAttributes<HTMLHeadingElement>;
const Title = ({ className = "", ...rest }: TitleProps) => (
  <h2 className={`${classes.title} ${className}`} {...rest} />
);

type ActionsProps = HTMLAttributes<HTMLDivElement>;
const Actions = ({ className = "", ...rest }: ActionsProps) => (
  <div className={`${classes.actions} ${className}`} {...rest} />
);

/* ===== default export + 정적 속성 ===== */
type BottomSheetComponent = typeof BaseBottomSheet & {
  Title: typeof Title;
  Actions: typeof Actions;
};

const BottomSheet = BaseBottomSheet as BottomSheetComponent;
BottomSheet.Title = Title;
BottomSheet.Actions = Actions;

export default BottomSheet;
