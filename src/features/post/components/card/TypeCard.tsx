import { useEffect, useState, type CSSProperties } from "react";
import classes from "./TypeCard.module.css";

type TypeCardProps = {
  title: string;
  firstLine: string;
  secondLine: string;
  revealOnMount?: boolean;
  revealDelay?: number;
  revealDurationMs?: number;
  revealEasing?: string;
  className?: string;
};

const TypeCard = ({
  title,
  firstLine,
  secondLine,
  revealOnMount = false,
  revealDelay = 600,
  revealDurationMs = 1000,
  revealEasing = "ease-in",
  className = "",
}: TypeCardProps) => {
  // revealOnMount=false면 초기에 바로 보이도록
  const [revealed, setRevealed] = useState(!revealOnMount);

  useEffect(() => {
    if (!revealOnMount) return;
    const t = setTimeout(() => setRevealed(true), revealDelay);
    return () => clearTimeout(t);
  }, [revealOnMount, revealDelay]);

  const style: CSSProperties & Record<string, string | number> = {
    "--reveal-delay": `${revealDelay}ms`,
    "--reveal-duration": `${revealDurationMs}ms`,
    "--reveal-easing": revealEasing,
  };

  const rootClassName = [
    classes.typeCard,
    revealed ? classes.revealed : classes.hidden,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} style={style}>
      <div className={classes.content}>
        <h2 className={classes.title}>{title}</h2>
        <div className={classes.guide}>
          <p>{firstLine}</p>
          <p>{secondLine}</p>
        </div>
      </div>
    </div>
  );
};

export default TypeCard;
