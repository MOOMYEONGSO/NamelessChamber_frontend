import { useMemo, useRef, useState, useEffect } from "react";
import Form from "../../../components/form/Form";
import Input from "../../../components/input/Input";
import Text from "../../../components/text/Text";
import classes from "./SignupPage.module.css";
import { useSignup } from "../hooks/useAuth";
import { PATHS } from "../../../constants/path";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../../api/helpers";
import InputMessage from "../../../components/input/InputMessage";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateNickname,
} from "../validation/validators";
import { firstError, hasError } from "../validation/validationHelpers";
import Button from "../../../components/button/Button";
import LoadingDots from "../../../components/loading/LoadingDots";
import { VISIT_MOTIVES, type VisitMotive } from "../constants/signup";
import MotiveOption from "../components/MotiveOption";
import BackArrow from "../../../assets/icons/BackArrow";
import PinInput from "../../../components/input/PinInput";
import Letter from "../../post/components/letter/Letter";
import { getSignupCompleteLetter } from "../constants/messages";

type Step = "visitMotive" | "nickname" | "pw" | "pwc" | "email" | "complete";

function SignupPage() {
  const navigate = useNavigate();

  // ====== states ======
  const [step, setStep] = useState<Step>("visitMotive");
  const [visitMotive, setVisitMotive] = useState<VisitMotive | null>(null);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState<string>("");

  const nicknameRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const pwcRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // ====== signup mutation ======
  const { mutate: signup, isPending } = useSignup({
    onSuccess: () => {
      setServerError("");
      setStep("complete");
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      setServerError(msg);
    },
  });

  // ====== validators ======
  const trimmedNickname = nickname.trim();
  const trimmedEmail = email.trim();
  const nicknameIssues = useMemo(
    () => validateNickname(trimmedNickname),
    [trimmedNickname],
  );
  const emailIssues = useMemo(
    () => validateEmail(trimmedEmail),
    [trimmedEmail],
  );
  const pwIssues = useMemo(() => validatePassword(password), [password]);
  const pwcIssues = useMemo(
    () => validatePasswordConfirm(password, passwordConfirm),
    [password, passwordConfirm],
  );

  const nicknameError = firstError(nicknameIssues);
  const emailError = firstError(emailIssues);
  const pwError = firstError(pwIssues);
  const pwcError = firstError(pwcIssues);

  const hasVisitMotive = visitMotive !== null;
  const hasNickname = trimmedNickname.length > 0;
  const hasPw = password.length > 0;
  const hasPwc = passwordConfirm.length > 0;
  const hasEmail = trimmedEmail.length > 0;

  const showNicknameError = hasNickname && hasError(nicknameIssues);
  const showPwError = hasPw && hasError(pwIssues);
  const showPwcError = hasPwc && hasError(pwcIssues);
  const showEmailError = hasEmail && hasError(emailIssues);

  const showNicknameSuccess = hasNickname && !hasError(nicknameIssues);
  const showPwSuccess = hasPw && !hasError(pwIssues);
  const showPwcSuccess = hasPwc && !hasError(pwcIssues);
  const showEmailSuccess = hasEmail && !hasError(emailIssues);

  const canGoNextVisitMotive = hasVisitMotive;
  const canGoNextNickname = showNicknameSuccess && !isPending;
  const canSubmitEmail = showEmailSuccess && !isPending;

  const canGoNextPw = showPwSuccess && !isPending;
  const canGoNextPwc = showPwcSuccess && !isPending;

  // ====== handlers ======
  function goNextOrSubmit() {
    if (isPending) return;

    if (step === "visitMotive") {
      if (!canGoNextVisitMotive) return;
      setServerError("");
      setStep("nickname");
      return;
    }

    if (step === "nickname") {
      if (!canGoNextNickname) {
        nicknameRef.current?.focus();
        return;
      }
      setServerError("");
      setStep("pw");
      return;
    }

    if (step === "pw") {
      if (!canGoNextPw) {
        pwRef.current?.focus();
        return;
      }
      setServerError("");
      setPasswordConfirm("");
      setStep("pwc");
      return;
    }

    if (step === "pwc") {
      if (!canGoNextPwc) {
        pwcRef.current?.focus();
        return;
      }
      setServerError("");
      setStep("email");
      return;
    }

    if (step === "email") {
      if (!canSubmitEmail) {
        emailRef.current?.focus();
        return;
      }
      setServerError("");
      signup({
        visitMotive: visitMotive!,
        nickname: trimmedNickname,
        password,
        email: trimmedEmail,
      });
      return;
    }

    if (step === "complete") {
      navigate(PATHS.HOME);
      return;
    }
  }

  function handleNicknameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    goNextOrSubmit();
  }

  function handlePwKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    goNextOrSubmit();
  }

  function handlePwcKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    goNextOrSubmit();
  }

  function handleEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    goNextOrSubmit();
  }

  useEffect(() => {
    if (step === "nickname") nicknameRef.current?.focus();
    if (step === "pw") pwRef.current?.focus();
    if (step === "pwc") pwcRef.current?.focus();
    if (step === "email") emailRef.current?.focus();
  }, [step]);

  function goPrev() {
    setServerError("");
    if (step === "email") setStep("pwc");
    else if (step === "pwc") {
      setStep("pw");
      setPasswordConfirm("");
    } else if (step === "pw") setStep("nickname");
    else if (step === "nickname") setStep("visitMotive");
  }

  // 이전 버튼: 첫 단계(마음)에선 회원가입을 빠져나가고, 이후 단계에선 한 단계씩 되돌립니다.
  function handleBack() {
    if (step === "visitMotive") {
      navigate(-1);
      return;
    }
    goPrev();
  }

  // X 버튼 클릭 시 이전 화면으로 되돌아갑니다. (또는 PATHS.HOME 등으로 변경 가능)
  function handleClose() {
    navigate(-1);
  }

  const isEnabled =
    step === "visitMotive"
      ? canGoNextVisitMotive
      : step === "nickname"
        ? canGoNextNickname
        : step === "pw"
          ? canGoNextPw
          : step === "pwc"
            ? canGoNextPwc
            : step === "email"
              ? canSubmitEmail
              : true;

  const getTitle = () => {
    switch (step) {
      case "visitMotive":
        return "어떤 마음을 안고 오셨나요?";
      case "nickname":
        return "어떤 이름으로 불러드릴까요?";
      case "pw":
        return "비밀번호 4자리를 입력해주세요";
      case "pwc":
        return "비밀번호 확인하기";
      case "email":
        return "편지 받을 이메일";
      case "complete":
        return "무명소에서 보낸,\n첫번째 편지가 도착했어요.";
      default:
        return "회원가입";
    }
  };

  const letter = getSignupCompleteLetter(trimmedNickname);

  return (
    <section className={classes.signup}>
      <header className={classes.topBar}>
        {step !== "complete" ? (
          <button
            type="button"
            onClick={handleBack}
            className={classes.iconBtn}
            aria-label="이전"
          >
            <BackArrow />
          </button>
        ) : (
          <div />
        )}
        {step !== "complete" && (
          <button
            type="button"
            onClick={handleClose}
            className={classes.iconBtn}
            aria-label="닫기"
          >
            &#x2715;
          </button>
        )}
      </header>

      {step === "complete" ? (
        <h1 className={classes.completeTitle}>{getTitle()}</h1>
      ) : (
        <Text variant="t1">{getTitle()}</Text>
      )}

      <Form
        onSave={goNextOrSubmit}
        className={`${classes.form} ${classes.controlWidth}`}
      >
        {/* Step 1. 가입 목적 선택 */}
        {step === "visitMotive" && (
          <div className={classes.fieldGroup} style={{ gap: "0.8rem" }}>
            {VISIT_MOTIVES.map((m) => (
              <MotiveOption
                key={m.value}
                label={m.label}
                selected={visitMotive === m.value}
                onSelect={() => {
                  if (serverError) setServerError("");
                  setVisitMotive(m.value);
                }}
              />
            ))}
          </div>
        )}

        {/* Step 2. 닉네임 설정 */}
        {step === "nickname" && (
          <div className={classes.fieldGroup}>
            <Input
              ref={nicknameRef}
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => {
                if (serverError) setServerError("");
                setNickname(e.target.value);
              }}
              onKeyDown={handleNicknameKeyDown}
              autoComplete="off"
              enterKeyHint="next"
              aria-invalid={!!showNicknameError || !!serverError}
            />
            {showNicknameError ? (
              <InputMessage type="error" aria-live="polite">
                {nicknameError}
              </InputMessage>
            ) : showNicknameSuccess ? (
              <InputMessage type="success" aria-live="polite">
                사용 가능합니다.
              </InputMessage>
            ) : (
              <InputMessage />
            )}
          </div>
        )}

        {/* Step 3. 비밀번호 설정 */}
        {step === "pw" && (
          <div className={classes.fieldGroup}>
            <PinInput
              key="pin-pw"
              ref={pwRef}
              value={password}
              onChange={(val) => {
                if (serverError) setServerError("");
                setPassword(val);
              }}
              onKeyDown={handlePwKeyDown}
              aria-invalid={!!showPwError}
            />
            {showPwError ? (
              <InputMessage type="error" aria-live="polite">
                {pwError}
              </InputMessage>
            ) : showPwSuccess ? (
              <InputMessage type="success" aria-live="polite">
                사용 가능합니다.
              </InputMessage>
            ) : (
              <InputMessage />
            )}
          </div>
        )}

        {/* Step 4. 비밀번호 확인 설정 */}
        {step === "pwc" && (
          <div className={classes.fieldGroup}>
            <PinInput
              key="pin-pwc"
              ref={pwcRef}
              value={passwordConfirm}
              onChange={(val) => {
                if (serverError) setServerError("");
                setPasswordConfirm(val);
              }}
              onKeyDown={handlePwcKeyDown}
              aria-invalid={!!showPwcError}
            />
            {showPwcError ? (
              <InputMessage type="error" aria-live="polite">
                {pwcError}
              </InputMessage>
            ) : showPwcSuccess ? (
              <InputMessage type="success" aria-live="polite">
                일치합니다.
              </InputMessage>
            ) : (
              <InputMessage />
            )}
          </div>
        )}

        {/* Step 5. 이메일 설정 */}
        {step === "email" && (
          <div className={classes.fieldGroup}>
            <Input
              ref={emailRef}
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => {
                if (serverError) setServerError("");
                setEmail(e.target.value);
              }}
              onKeyDown={handleEmailKeyDown}
              autoComplete="username"
              aria-invalid={!!showEmailError}
              enterKeyHint="done"
            />
            {showEmailError ? (
              <InputMessage type="error" aria-live="polite">
                {emailError}
              </InputMessage>
            ) : serverError ? (
              <InputMessage type="error" aria-live="polite">
                {serverError}
              </InputMessage>
            ) : (
              <InputMessage />
            )}
          </div>
        )}

        {/* Step 6. 완료 (편지) */}
        {step === "complete" && (
          <div className={classes.fieldGroup}>
            <Letter to={letter.to} from={letter.from}>
              {letter.body}
            </Letter>
          </div>
        )}

        {/* 이메일 단계 서버 에러는 입력란 바로 아래(필드 슬롯)에 표시하므로 여기선 중복 제외.
            그 외 단계에선 공용 에러 슬롯으로 노출하고, 비어 있을 땐 간격용 스페이서로 유지 */}
        {serverError && step !== "email" ? (
          <InputMessage type="error" aria-live="polite">
            {serverError}
          </InputMessage>
        ) : (
          <InputMessage />
        )}

        <div className={classes.btn}>
          <Button
            type="button"
            onClick={goNextOrSubmit}
            disabled={!isEnabled || isPending}
            aria-disabled={!isEnabled}
            variant="sub"
            state={isPending || isEnabled ? "active" : "default"}
            data-busy={isPending ? "true" : "false"}
          >
            {step === "email" ? (
              isPending ? (
                <LoadingDots />
              ) : (
                "가입하기"
              )
            ) : step === "complete" ? (
              "완료"
            ) : (
              "다음"
            )}
          </Button>
        </div>
      </Form>
    </section>
  );
}

export default SignupPage;
