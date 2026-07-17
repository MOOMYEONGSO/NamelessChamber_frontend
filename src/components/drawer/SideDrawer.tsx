import { useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import classes from "./SideDrawer.module.css";
import { PATHS } from "../../constants/path";
import { isAuthenticatedUser } from "../../features/auth/api/tokenStore";
import { useLogout } from "../../features/auth/hooks/useAuth";
import Panel from "../../assets/icons/Panel";

type SideDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SideDrawer = ({ isOpen, onClose }: SideDrawerProps) => {
  const navigate = useNavigate();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const loggedIn = isAuthenticatedUser();

  // ESC 키로 닫기 (열려 있을 때만 리스너 등록)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function handleNavigate(path: string) {
    onClose();
    navigate(path);
  }

  function handleLogout() {
    onClose();
    logout(undefined, {
      onSettled: () => {
        // 브라우저 레벨에서 홈으로 즉시 새로고침하여 앱 상태를 완전히 초기화
        window.location.replace(PATHS.HOME);
      },
    });
  }

  return ReactDOM.createPortal(
    <div
      className={`${classes.backdrop} ${isOpen ? classes.open : ""}`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <aside
        className={`${classes.panel} ${isOpen ? classes.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={classes.header}>
          <button
            type="button"
            className={classes.logo}
            onClick={() => handleNavigate(PATHS.HOME)}
            aria-label="무명소 홈"
          >
            無名所
          </button>
          <button
            type="button"
            className={classes.close}
            onClick={onClose}
            aria-label="메뉴 닫기"
          >
            <Panel />
          </button>
        </div>

        <nav className={classes.nav}>
          <ul className={classes.menu}>
            <li>
              {/* TODO: 무명소 오리지널 페이지 연결 예정 */}
              <button type="button" className={classes.item} onClick={onClose}>
                무명소 오리지널
              </button>
            </li>
            <li>
              {/* TODO: 무명소에 대하여 페이지 연결 예정 */}
              <button type="button" className={classes.item} onClick={onClose}>
                무명소에 대하여
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${classes.item} ${classes.disabled}`}
                disabled
              >
                수집소(SHOP) - coming soon
              </button>
            </li>
            <li>
              <button
                type="button"
                className={classes.item}
                onClick={() => handleNavigate(PATHS.PROFILE)}
              >
                MY PAGE
              </button>
            </li>
            <li>
              <button
                type="button"
                className={classes.item}
                onClick={() => handleNavigate(PATHS.FEEDBACK)}
              >
                문의하기
              </button>
            </li>
          </ul>

          {loggedIn && (
            <button
              type="button"
              className={classes.logout}
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
            >
              로그아웃
            </button>
          )}
        </nav>
      </aside>
    </div>,
    document.body
  );
};

export default SideDrawer;
