import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../button/Button";
import Logo from "../logo/Logo";
import classes from "./Header.module.css";
import { PATHS } from "../../constants/path";
import {
  isAuthenticatedUser,
  isAdminUser,
} from "../../features/auth/api/tokenStore";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState<boolean>(isAuthenticatedUser());
  const [isAdmin, setIsAdmin] = useState<boolean>(
    loggedIn ? isAdminUser() : false
  );

  useEffect(() => {
    const update = () => {
      const authed = isAuthenticatedUser();
      setLoggedIn(authed);
      setIsAdmin(authed ? isAdminUser() : false);
    };
    window.addEventListener("auth:update", update);
    return () => window.removeEventListener("auth:update", update);
  }, []);

  function handleProfile() {
    navigate(PATHS.PROFILE);
  }
  
  function handleAdmin() {
    navigate(PATHS.ADMIN_POSTS);
  }


  const hiddenPaths = [
    PATHS.LOGIN,
    PATHS.SIGN_UP,
    PATHS.NICKNAME,
    PATHS.PROFILE,
  ] as const;
  const shouldHideButton = hiddenPaths.some((p) => p === location.pathname);

  return (
    <header className={classes.header}>
      <Link to={PATHS.HOME} className={classes.logoLink}>
        <Logo />
      </Link>

      {!shouldHideButton &&
        (loggedIn ? (
          <div className={classes.userArea}>
            {isAdmin && (
              <Button alwaysHoverStyle onClick={handleAdmin}>
                관리자
              </Button>
            )}
            <Button alwaysHoverStyle onClick={handleProfile}>
              마이페이지
            </Button>
          </div>
        ) : (
          <Link to={PATHS.LOGIN}>
            <Button alwaysHoverStyle>로그인하기</Button>
          </Link>
        ))}
    </header>
  );
};

export default Header;
