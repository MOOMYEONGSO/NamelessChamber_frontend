import Camera from "../../../../assets/icons/Camera";
import iconUp from "../../../../assets/icons/icon_up.svg";
import iconDown from "../../../../assets/icons/icon_down.svg";
import classes from "./KeyboardAccessoryBar.module.css";

type Props = {
  onCamera: () => void;
  onUp: () => void;
  onDown: () => void;
  upDisabled?: boolean;
  downDisabled?: boolean;
  cameraDisabled?: boolean;
};

/** 모바일 키보드 바로 위 액세서리 바 (이미지 등록 / 커서 위·아래 이동) */
export default function KeyboardAccessoryBar({
  onCamera,
  onUp,
  onDown,
  upDisabled,
  downDisabled,
  cameraDisabled,
}: Props) {
  return (
    <div className={classes.bar}>
      <button
        type="button"
        className={classes.camera}
        onPointerDown={(e) => e.preventDefault()}
        onClick={onCamera}
        disabled={cameraDisabled}
        aria-label="이미지 등록"
      >
        <Camera />
      </button>

      <div className={classes.nav}>
        <button
          type="button"
          className={classes.btn}
          onPointerDown={(e) => {
            e.preventDefault();
            onUp();
          }}
          disabled={upDisabled}
          aria-label="커서 한 줄 위로"
        >
          <img src={iconUp} alt="" className={classes.icon} />
        </button>
        <button
          type="button"
          className={classes.btn}
          onPointerDown={(e) => {
            e.preventDefault();
            onDown();
          }}
          disabled={downDisabled}
          aria-label="커서 한 줄 아래로"
        >
          <img src={iconDown} alt="" className={classes.icon} />
        </button>
      </div>
    </div>
  );
}
