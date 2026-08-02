import type { ReactNode } from "react";
import classes from "./Letter.module.css";

type LetterProps = {
  /** 받는 사람 — 렌더 시 "To." 접두가 붙습니다. */
  to?: ReactNode;
  /** 보내는 사람 — 렌더 시 "From" 접두가 붙습니다. */
  from?: ReactNode;
  /** 본문 (여러 줄은 개행으로 전달) */
  children?: ReactNode;
  className?: string;
};

/**
 * 편지지(줄노트) UI. To./From. 형식의 범용 편지 포맷을 표현합니다.
 * 모든 줄이 동일한 line-height(--letter-line)로 정렬되어 가로줄 위에 앉습니다.
 */
const Letter = ({ to, from, children, className = "" }: LetterProps) => {
  return (
    <div className={`${classes.paper} ${className}`.trim()}>
      <div className={classes.sheet}>
        {to != null && <p className={classes.to}>To. {to}</p>}
        {children != null && <div className={classes.body}>{children}</div>}
        {from != null && <p className={classes.from}>From {from}</p>}
      </div>
    </div>
  );
};

export default Letter;
