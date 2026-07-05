import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./FadeInOnView.module.css";

type Props = {
  children: ReactNode;
  className?: string;
  once?: boolean;
};

const FadeInOnView = ({ children, className, once = true }: Props) => {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (once) {
          if (entry.isIntersecting) {
            setSeen(true);
            io.unobserve(entry.target);
          }
        } else {
          setSeen(entry.isIntersecting);
        }
      },
      { threshold: 0.5 }
    );

    io.observe(node);
    return () => io.disconnect();
  }, [once]);

  return (
    <p
      ref={ref}
      className={`${styles.content} ${seen ? styles.visible : ""} ${
        className ?? ""
      }`}
    >
      {children}
    </p>
  );
};

export default FadeInOnView;
