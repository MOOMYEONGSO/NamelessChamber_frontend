import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { useEffect } from "react";
import { attachGlobalFullscreenListenersOnce } from "./lib/fullscreen/fullscreenStore";
import { initGa, trackPageView } from "./lib/analytics/ga";

function App() {
  useEffect(() => {
    attachGlobalFullscreenListenersOnce();

    initGa();
    const getCurrentPath = () =>
      `${router.state.location.pathname}${router.state.location.search}`;

    trackPageView(getCurrentPath());
    const unsubscribe = router.subscribe((state) => {
      trackPageView(`${state.location.pathname}${state.location.search}`);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
