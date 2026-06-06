import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect, useMemo } from "react";
import Button from "../../../components/button/Button";
import Form from "../../../components/form/Form";
import Input from "../../../components/input/Input";
import Paragraph from "../../../components/paragraph/Paragraph";
import classes from "./LoginPage.module.css";
import { PATHS } from "../../../constants/path";
import { useLogin } from "../hooks/useAuth";
import { useToast } from "../../../contexts/ToastContext";
import { getErrorMessage } from "../../../api/helpers";
import InputMessage from "../../../components/input/InputMessage";
import LoadingDots from "../../../components/loading/LoadingDots";
import { validateEmail } from "../validation/validators";
import { firstError, hasError } from "../validation/validationHelpers";
import PinInput from "../../../components/input/PinInput";

function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string>("");

  const [step, setStep] = useState<"email" | "password">("email");
  const [emailTried, setEmailTried] = useState(false);
  const [pwTried, setPwTried] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const { mutate: login, isPending } = useLogin({
    onSuccess: () => {
      showToast("로그인에 성공했습니다.", "check");
      navigate(PATHS.HOME);
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      setServerError(msg);
    },
  });

  const trimmedEmail = email.trim();
  const hasTypedEmail = trimmedEmail.length > 0;

  const emailIssues = useMemo(
    () => validateEmail(trimmedEmail),
    [trimmedEmail],
  );
  const emailValid = !hasError(emailIssues);
  const emailError = firstError(emailIssues);

  const showEmailError = emailTried && !emailValid;
  const showPwError = pwTried && password.trim().length === 0;

  const canSubmit =
    step === "password" && emailValid && password.trim().length > 0;

  function goNextOrSubmit() {
    if (isPending) return;

    if (step === "email") {
      setEmailTried(true);
      if (!emailValid) {
        emailRef.current?.focus();
        return;
      }
      setServerError("");
      setStep("password");
      setPwTried(false);
      return;
    }

    // step === "password"
    setPwTried(true);

    if (!password.trim()) {
      setServerError("비밀번호를 입력해주세요");
      passwordRef.current?.focus();
      return;
    }

    if (!emailValid) {
      setServerError("올바른 이메일 형식을 입력해주세요");
      setStep("email");
      emailRef.current?.focus();
      return;
    }

    setServerError("");
    login({ email: trimmedEmail, password: password.trim() });
  }

  function handleEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    setEmailTried(true);
    goNextOrSubmit();
  }

  function handlePwKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    setPwTried(true);
    goNextOrSubmit();
  }

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (step === "password") passwordRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step === "password" && !emailValid) {
      setStep("email");
      setPassword("");
      setPwTried(false);
    }
  }, [emailValid, step]);

  const buttonLabel = isPending ? (
    <LoadingDots />
  ) : step === "email" ? (
    hasTypedEmail ? (
      "다음"
    ) : (
      "로그인 하기"
    )
  ) : (
    "로그인 하기"
  );

  const isButtonEnabled = step === "email" ? emailValid : canSubmit;

  return (
    <section className={classes.login}>
      <Paragraph>로그인</Paragraph>

      <Form
        onSave={goNextOrSubmit}
        className={`${classes.form} ${classes.controlWidth}`}
      >
        <div className={classes.fieldGroup}>
          <Input
            ref={emailRef}
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => {
              if (serverError) setServerError("");
              setEmail(e.target.value);
              setEmailTried(false);
            }}
            onKeyDown={handleEmailKeyDown}
            autoComplete="username"
            aria-invalid={!!showEmailError}
          />
          {showEmailError ? (
            <InputMessage type="error" aria-live="polite">
              {emailError}
            </InputMessage>
          ) : (
            <InputMessage />
          )}
        </div>

        <div
          className={`${classes.passwordArea} ${
            step === "password" ? classes.show : ""
          }`}
          aria-hidden={step !== "password"}
        >
          <PinInput
            ref={passwordRef}
            value={password}
            onChange={(val) => {
              if (serverError) setServerError("");
              setPassword(val);
              setPwTried(false); // 입력 재시작 시 에러 숨김
            }}
            onKeyDown={handlePwKeyDown}
            aria-invalid={!!showPwError}
          />
          {showPwError ? (
            <InputMessage type="error" aria-live="polite">
              비밀번호를 입력해주세요
            </InputMessage>
          ) : serverError && step === "password" ? (
            <InputMessage type="error" aria-live="polite">
              {serverError}
            </InputMessage>
          ) : (
            <InputMessage />
          )}
        </div>

        <div className={classes.btn}>
          <Button
            type="button"
            onClick={goNextOrSubmit}
            disabled={isPending}
            aria-disabled={!isButtonEnabled}
            variant={isButtonEnabled ? "main" : "main"}
            state={isButtonEnabled ? "active" : "default"}
            className={classes.submit}
          >
            {buttonLabel}
          </Button>
        </div>

        <div
          className={`${classes.signUpArea} ${
            step === "email" && !hasTypedEmail ? classes.show : ""
          }`}
          aria-hidden={step !== "email" || hasTypedEmail}
        >
          <Link to={PATHS.SIGN_UP} className={classes.fullWidth}>
            <Button variant="sub" state="active" className={classes.fullWidth}>
              회원가입
            </Button>
          </Link>
        </div>
      </Form>
    </section>
  );
}

export default LoginPage;
