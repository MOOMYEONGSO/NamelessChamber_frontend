import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../button/Button";
import Menu from "../../assets/icons/Menu";
import SideDrawer from "../drawer/SideDrawer";
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
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const authed = isAuthenticatedUser();
      setLoggedIn(authed);
      setIsAdmin(authed ? isAdminUser() : false);
    };
    window.addEventListener("auth:update", update);
    return () => window.removeEventListener("auth:update", update);
  }, []);

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
    <>
      <header className={classes.header}>
        <button
          type="button"
          className={classes.menuButton}
          onClick={() => setIsDrawerOpen(true)}
          aria-label="메뉴 열기"
          aria-expanded={isDrawerOpen}
        >
          <Menu />
        </button>

        {!shouldHideButton &&
          (loggedIn ? (
            isAdmin && (
              <div className={classes.userArea}>
                <Button alwaysHoverStyle onClick={handleAdmin}>
                  관리자
                </Button>
              </div>
            )
          ) : (
            <Link to={PATHS.LOGIN}>
              <Button alwaysHoverStyle>로그인하기</Button>
            </Link>
          ))}
      </header>

      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};

export default Header;
