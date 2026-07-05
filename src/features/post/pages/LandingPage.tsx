import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Text from "../../../components/text/Text";
import classes from "./LandingPage.module.css";
import { PATHS } from "../../../constants/path";
import { useEnsureSession } from "../../auth/hooks/useEnsureSession";
import Paragraph from "../../../components/paragraph/Paragraph";
import typeConfessImg from "../../../assets/landing/type-confess.png";
import photoLetterImg from "../../../assets/landing/photo-letter.png";

const WRITE_METHODS = [
  {
    mode: "text" as const,
    image: typeConfessImg,
    title: "글로 고백하기",
    desc: ["떠오르는 마음을 그대로 적어보세요.", "한 줄이어도 괜찮습니다."],
  },
  {
    mode: "image" as const,
    image: photoLetterImg,
    title: "사진으로 올리기",
    desc: [
      "오늘을 담은 사진 한 장을 올려보세요.",
      "말로 못 다 한 하루를 대신합니다.",
    ],
  },
];

function LandingPage() {
  const [step, setStep] = useState(0);
  const { ensure, ensuring } = useEnsureSession(false);
  const navigate = useNavigate();

  const handleEnter = async (mode: "text" | "image") => {
    setStep(1);
    try {
      const ok = await ensure();
      if (ok) {
        if (mode === "image") {
          navigate(PATHS.POST_NEW_IMAGE);
        } else {
          navigate(PATHS.POST_NEW_TYPE("today"));
        }
      }
    } catch (e) {
      console.error("세션 확보 실패:", e);
      setStep(0);
    }
  };

  return (
    <div className={classes.landing}>
      {step === 0 && (
        <div className={classes.content}>
          <Text variant="t1">작성방식을 선택해주세요.</Text>
          <div className={classes.cardGroup}>
            {WRITE_METHODS.map((method) => (
              <button
                key={method.mode}
                type="button"
                className={classes.methodCard}
                onClick={() => handleEnter(method.mode)}
                disabled={ensuring}
              >
                <img src={method.image} alt="" className={classes.cardImage} />
                <h3 className={classes.cardTitle}>{method.title}</h3>
                <p className={classes.cardDesc}>
                  {method.desc[0]}
                  <br />
                  {method.desc[1]}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={classes.content}>
          <div className={classes.guide}>
            <div className={classes.guideText}>
              <Text variant="t2">잠시만 기다려주세요.</Text>
              <Paragraph>오늘의 주제를 불러오고 있어요.</Paragraph>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
