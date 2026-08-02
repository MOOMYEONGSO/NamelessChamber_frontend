import type { ComponentPropsWithoutRef } from "react";
import classes from "./CardSkeleton.module.css";

type CardSkeletonProps = ComponentPropsWithoutRef<"div"> & {
  showCount?: boolean;
};

const CardSkeleton = ({ showCount = true, ...props }: CardSkeletonProps) => {
  return (
    <div
      className={classes.cardSkeleton}
      aria-busy="true"
      aria-label="Loading card"
      {...props}
    >
      <div className={classes.titleRow}>
        <span className={`${classes.block} ${classes.title}`} />
      </div>

      <div className={classes.metaRow}>
        {showCount && (
          <span className={`${classes.block} ${classes.count}`} aria-hidden />
        )}
      </div>
    </div>
  );
};

export default CardSkeleton;
