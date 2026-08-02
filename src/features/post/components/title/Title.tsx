import type { ComponentPropsWithoutRef } from "react";
import classes from "./Title.module.css";

type TitleType = ComponentPropsWithoutRef<"h2"> & {
  authorType: "self" | "other";
};

const Title = ({ authorType, children, ...props }: TitleType) => {
  return (
    <h2 className={`${classes.title} ${classes[authorType]}`} {...props}>
      {children}
    </h2>
  );
};

export default Title;
