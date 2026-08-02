import { useEffect, useRef } from "react";
// import { useAnonymousLogin } from "./useAuth";
import { hasValidToken } from "../api/tokenStore";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../constants/path";

export function useEnsureSession(auto = true) {
  const didRun = useRef(false);
  const navigate = useNavigate();
  // const { mutateAsync: anonLogin, isPending } = useAnonymousLogin();

  const ensure = async () => {
    if (hasValidToken()) return true;
    navigate(PATHS.LOGIN);
    return false;
  };

  useEffect(() => {
    if (!auto || didRun.current) return;
    didRun.current = true;
    if (!hasValidToken()) navigate(PATHS.LOGIN);
  }, [auto, navigate]);

  return { ensure, ensuring: false, ready: hasValidToken() };
}
