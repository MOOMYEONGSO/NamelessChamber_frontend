import { useNavigate } from "react-router-dom";
import RightArrow from "../../../assets/icons/RightArrow";
import classes from "./FeedbackCard.module.css";
import { PATHS } from "../../../constants/path";

const FeedbackCard = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(PATHS.FEEDBACK);
  };

  return (
    <div className={classes.feedbackCard}>
      <div>
        뭐든지 피드백 주세요.
        <br />더 좋은 서비스로 보답할게요!
      </div>
      <button
        type="button"
        className={classes.arrowBtn}
        onClick={handleClick}
        aria-label="피드백 보내기"
      >
        <RightArrow color="currentColor" />
      </button>
    </div>
  );
};

export default FeedbackCard;
