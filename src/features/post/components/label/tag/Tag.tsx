import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import classes from "./Tag.module.css";

type TagProps = ComponentPropsWithoutRef<"span"> & {
  children: ReactNode;
};

const Tag = ({ children, className, ...props }: TagProps) => {
  return (
    <span className={`${classes.tag} ${className ?? ""}`} {...props}>
      {children}
    </span>
  );
};

export default Tag;
