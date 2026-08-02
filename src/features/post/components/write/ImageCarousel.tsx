import { useRef, useState } from "react";
import type { LetterImage } from "../../hooks/useLetterImages";
import { MAX_IMAGES } from "../../utils/imageUpload";
import classes from "./ImageCarousel.module.css";

type Props = {
  images: LetterImage[];
  onRemove: (index: number) => void;
  onAdd: () => void;
};

/** 첨부 이미지 캐러셀 */
export default function ImageCarousel({ images, onRemove, onAdd }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  const scrollToIndex = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  };

  const canAdd = images.length < MAX_IMAGES;

  return (
    <div className={classes.carousel}>
      <div className={classes.track} ref={trackRef} onScroll={handleScroll}>
        {images.map((img, i) => (
          <div key={img.previewUrl} className={classes.slide}>
            <img
              src={img.previewUrl}
              alt={`첨부 이미지 ${i + 1}`}
              className={classes.image}
            />
            <button
              type="button"
              className={classes.remove}
              onClick={() => onRemove(i)}
              aria-label="이미지 삭제"
            >
              ✕
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            className={`${classes.slide} ${classes.addSlide}`}
            onClick={onAdd}
            aria-label="이미지 추가"
          >
            ＋
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className={classes.dots}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${classes.dot} ${
                Math.min(active, images.length - 1) === i
                  ? classes.dotActive
                  : ""
              }`}
              onClick={() => scrollToIndex(i)}
              aria-label={`${i + 1}번째 이미지로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
