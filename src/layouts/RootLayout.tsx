import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/header/Header";
import { useToast } from "../hooks/useToast";
import { useEffect, useRef } from "react";
import { PATHS } from "../constants/path";
import ToastContainer from "../components/toast/ToastContainer";

function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const firedRef = useRef(false);

  // 회원가입/로그인/마이페이지: 콘텐츠를 헤더 바로 아래(상단)에 정렬
  const isTopAligned = [PATHS.SIGN_UP, PATHS.LOGIN, PATHS.PROFILE].some(
    (p) => p === location.pathname
  );

  useEffect(() => {
    const onAuthExpired = () => {
      if (firedRef.current) return;
      firedRef.current = true;

      showToast("토큰이 유효하지 않습니다. 다시 로그인해주세요.", "cancel");

      const returnTo = location.pathname + location.search;
      navigate(
        `${PATHS.LOGIN}?returnTo=${encodeURIComponent(
          returnTo
        )}&reason=expired`,
        { replace: true }
      );

      setTimeout(() => {
        firedRef.current = false;
      }, 2000);
    };

    window.addEventListener("auth:expired", onAuthExpired as EventListener);
    return () =>
      window.removeEventListener(
        "auth:expired",
        onAuthExpired as EventListener
      );
  }, [location.pathname, location.search, navigate, showToast]);

  return (
    <div className="app">
      <Header />
      <main className={`main${isTopAligned ? " main-top" : ""}`}>
        <div className="container">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

export default RootLayout;
