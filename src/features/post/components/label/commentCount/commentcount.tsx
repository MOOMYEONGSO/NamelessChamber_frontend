import type { ComponentPropsWithRef } from "react";
import commentCountIcon from "../../../../../assets/labels/commentCount_label_icon.svg";
import classes from "../view/View.module.css";

type ViewProps = ComponentPropsWithRef<"div">;

const View = ({ className = "", children, ...props }: ViewProps) => {
  return (
    <div
      className={classes.view + (className ? ` ${className}` : "")}
      {...props}
    >
      <img src={commentCountIcon} className={classes.icon} alt="" />
      {children}
    </div>
  );
};

export default View;
