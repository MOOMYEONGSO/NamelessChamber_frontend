import type { ComponentPropsWithRef } from "react";
import viewIcon from "../../../../../assets/labels/view_label_icon.svg";
import classes from "./View.module.css";

type ViewProps = ComponentPropsWithRef<"div">;

const View = ({ className = "", children, ...props }: ViewProps) => {
  return (
    <div
      className={classes.view + (className ? ` ${className}` : "")}
      {...props}
    >
      <img src={viewIcon} className={classes.icon} alt="" />
      {children}
    </div>
  );
};

export default View;
