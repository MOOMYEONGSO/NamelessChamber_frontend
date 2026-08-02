import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import LandingPage from "../features/post/pages/LandingPage";
import PostListPage from "../features/post/pages/PostListPage";
import PostDetailPage from "../features/post/pages/PostDetailPage";
import PostWritePage from "../features/post/pages/PostWritePage";
import PostSubmitPage from "../features/post/pages/PostSubmitPage";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import SetNicknamePage from "../features/user/pages/SetNicknamePage";
import ProfilePage from "../features/user/pages/ProfilePage";
import FeedbackPage from "../features/feedback/pages/FeedbackPage";
import NotFoundPage from "../features/error/pages/NotFoundPage";
import ErrorPage from "../features/error/pages/ErrorPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import { PATHS } from "../constants/path";
import PostStreakPage from "../features/post/pages/PostStreakPage";
import AdminPostListPage from "../features/admin/pages/post/AdminPostListPage";
import AdminPostDetailPage from "../features/admin/pages/post/AdminPostDetailPage";
import PostRerollPage from "../features/post/pages/PostRerollPage";
import AllPostsFeedPage from "../features/post/pages/AllPostsFeedPage";
import PostImagePage from "../features/post/pages/PostImagePage";

const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: PATHS.HOME, element: <LandingPage /> },
      { path: PATHS.LANDING_INSTA, element: <LandingPage /> },
      { path: PATHS.LANDING_BLIND, element: <LandingPage /> },
      { path: PATHS.LANDING_THREAD, element: <LandingPage /> },
      {
        path: PATHS.POST_REROLL,
        element: <PostRerollPage />,
      },

      // ₩TODO: 전체 포스트 피드 페이지 추가 (임시로 PostListPage 대신 AllPostsFeedPage 사용)
      // { path: PATHS.POST_ALL, element: <PostListPage /> },
      { path: PATHS.POST_ALL, element: <AllPostsFeedPage /> },
      { path: PATHS.POST_LIST, element: <PostListPage /> },
      { path: PATHS.POST_DETAIL, element: <PostDetailPage /> },
      { path: PATHS.LOGIN, element: <LoginPage /> },
      { path: PATHS.SIGN_UP, element: <SignupPage /> },
      { path: PATHS.NICKNAME, element: <SetNicknamePage /> },

      {
        element: <AdminRoute />,
        children: [
          { path: PATHS.ADMIN_POSTS, element: <AdminPostListPage /> },
          {
            path: `${PATHS.ADMIN_POSTS}/:type`,
            element: <AdminPostListPage />,
          },
          {
            path: `${PATHS.ADMIN_POSTS}/v/:id`,
            element: <AdminPostDetailPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [{ path: PATHS.PROFILE, element: <ProfilePage /> }],
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [{ path: PATHS.FEEDBACK, element: <FeedbackPage /> }],
  },
  { path: PATHS.POST_STREAK, element: <PostStreakPage /> },
  { path: PATHS.POST_SUBMIT, element: <PostSubmitPage /> },
  { path: PATHS.POST_NEW_IMAGE, element: <PostImagePage /> },
  { path: PATHS.POST_NEW, element: <PostWritePage /> },
  { path: PATHS.ERROR, element: <ErrorPage /> },
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
