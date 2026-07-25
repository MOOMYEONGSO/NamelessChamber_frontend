import { useNavigate } from "react-router-dom";
import classes from "./LandingPage.module.css";
import { PATHS } from "../../../constants/path";
import { useEnsureSession } from "../../auth/hooks/useEnsureSession";
import Card from "../components/card/Card";
import Button from "../../../components/button/Button";

const HOME_TITLE = "혼자라고 느껴지는 마음에,\n편지를 조용히 건넵니다.";

// 메인 홈은 API로 카드를 가져오지 않고 고정(하드코딩) 데이터로 표시
const HOME_CARD = {
  to: "혼자 버티는 사람에게",
  from: "서울에 사는 30살 청년",
  createdAt: "2026-06-20T14:14:00Z", // KST 2026.06.20 23:14
  contentLength: 520,
};

function LandingPage() {
  const navigate = useNavigate();
  const { ensure, ensuring } = useEnsureSession(false);

  const handleWrite = async () => {
    try {
      const ok = await ensure();
      if (ok) navigate(PATHS.POST_NEW_TYPE("text"));
    } catch (e) {
      console.error("세션 확보 실패:", e);
    }
  };

  return (
    <div className={classes.landing}>
      <h1 className={classes.title}>{HOME_TITLE}</h1>

      <div className={classes.stackArea}>
        <div className={classes.stack}>
          <span
            className={`${classes.decor} ${classes.decor4}`}
            aria-hidden="true"
          />
          <span
            className={`${classes.decor} ${classes.decor3}`}
            aria-hidden="true"
          />
          <span
            className={`${classes.decor} ${classes.decor2}`}
            aria-hidden="true"
          />
          <span
            className={`${classes.decor} ${classes.decor1}`}
            aria-hidden="true"
          />
          <span
            className={`${classes.decor} ${classes.decor0}`}
            aria-hidden="true"
          />
          <Card
            className={classes.frontCard}
            to={HOME_CARD.to}
            from={HOME_CARD.from}
            createdAt={HOME_CARD.createdAt}
            contentLength={HOME_CARD.contentLength}
          />
        </div>
      </div>

      <div className={classes.actions}>
        <Button
          variant="main"
          state="active"
          onClick={handleWrite}
          disabled={ensuring}
          className={classes.writeBtn}
        >
          작성하기
        </Button>
      </div>
    </div>
  );
}

export default LandingPage;
