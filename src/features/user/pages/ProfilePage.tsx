import { useNavigate } from "react-router-dom";
import Button from "../../../components/button/Button";
import CoinInfo from "../components/CoinInfo";
import FeedbackCard from "../components/FeedbackCard";
import UserInfo from "../components/UserInfo";
import { useUserMe } from "../hooks/useUser";
import classes from "./ProfilePage.module.css";
import { PATHS } from "../../../constants/path";
import PostTabs from "../components/PostTabs";
import { useReadPosts } from "../hooks/useReadPosts";
import { useEffect, useMemo, useRef, useState } from "react";
import CardListContainer from "../../post/components/card/CardListContainer";
import { useWrittenPosts } from "../hooks/useWrittenPosts";
import ProfileSkeleton from "../components/ProfileSkeleton";
import { useLogout } from "../../auth/hooks/useAuth";
import LoadingDots from "../../../components/loading/LoadingDots";
import { useToast } from "../../../contexts/ToastContext";
import { ApiError } from "../../../api/types";

function ProfilePage() {
  const [currentTab, setCurrentTab] = useState<"written" | "read">("written");
  const { data: me, isLoading: isMeLoading, error, isError } = useUserMe();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const hasHandledErrorRef = useRef(false);

  const showUserSkeleton = isMeLoading || !me;

  useEffect(() => {
    if (!isError || hasHandledErrorRef.current) return;
    hasHandledErrorRef.current = true;
    if (error instanceof ApiError && error.code === 1018) {
      navigate(PATHS.NICKNAME, {
        replace: true,
        state: { from: PATHS.PROFILE },
      });
    } else {
      showToast(
        "프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
        "cancel",
      );
    }
  }, [isError, error, navigate, showToast]);

  const { data: readData, isLoading: isReadLoading } = useReadPosts(
    currentTab === "read",
  );
  const { data: writtenData, isLoading: isWrittenLoading } =
    useWrittenPosts();

  const posts = useMemo(() => {
    if (currentTab === "read") return readData?.posts ?? [];
    return writtenData ?? [];
  }, [currentTab, readData, writtenData]);

  const isListLoading =
    currentTab === "read" ? isReadLoading : isWrittenLoading;

  const isEmpty = !isListLoading && (posts?.length ?? 0) === 0;

  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  function handleLogout() {
    logout(undefined, {
      onSettled: () => {
        //브라우저 레벨에서 홈으로 즉시 새로고침하여 앱 상태를 완전히 초기화
        window.location.replace(PATHS.HOME);
      },
    });
  }

  function handleProfileEditClick() {
    showToast("준비 중인 기능입니다.", "info");
  }

  function handleCoinClick() {
    if (!me?.coin) {
      showToast("열람권이 없어요! 글을 작성하고 열람권을 받아보세요.", "info");
    } else {
      navigate(PATHS.POST_ALL);
    }
  }

  return (
    <section className={classes.profile}>
      <div className={classes.profileSection}>
        {showUserSkeleton ? (
          <ProfileSkeleton />
        ) : (
          <>
            <UserInfo nickname={me.nickname} />
            <CoinInfo coin={me.coin} onClick={handleCoinClick} />
            <Button alwaysHoverStyle onClick={handleProfileEditClick}>
              프로필 편집
            </Button>
            <FeedbackCard />
            <button
              className={classes.logout}
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
            >
              {isLoggingOut ? <LoadingDots /> : "로그아웃"}
            </button>
          </>
        )}
      </div>

      <div className={classes.listSection}>
        <PostTabs
          onChange={(id) => setCurrentTab(id as "written" | "read")}
        />
        <CardListContainer
          posts={posts}
          isLoading={isListLoading}
          isEmpty={isEmpty}
          coin={me?.coin ?? 0}
          type="public"
          emptyMessage={
            currentTab === "read"
              ? "아직 열람한 글이 없어요."
              : "아직 작성한 글이 없어요."
          }
          interactionMode="direct"
        />
      </div>
    </section>
  );
}

export default ProfilePage;
