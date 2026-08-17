import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import NotificationsPage from "./Pages/NotificationsPage";
import ChatPage from "./Pages/ChatPage";
import CallPage from "./Pages/CallPage";
import OnboardingPage from "./Pages/OnboardingPage";

import { Toaster } from "react-hot-toast";

import useAuthUser from "./hooks/useAuthUser";
import Layout from "./components/Layout.jsx";
import PageLoader from "./components/PageLoader.jsx";

import { useThemeStore } from "./Store/useThemeStore.js";

import StreamVideoProvider from "./components/StreamVideoProvider.jsx";
import StreamChatProvider from "./components/StreamChatProvider.jsx";
import IncomingCall from "./components/Incomingcall.jsx";

function App() {
  const { authUser, isLoading } = useAuthUser();
  const { theme } = useThemeStore();

  if (isLoading) {
    return <PageLoader />;
  }

  const isAuthenticated = !!authUser;
  const isOnboarded = authUser?.isOnboarded;

  return (
    <div data-theme={theme}>
      {isAuthenticated && isOnboarded ? (
        <StreamVideoProvider>
          <StreamChatProvider>
            {/* Global incoming call handler */}
            <IncomingCall />

            <Routes>
              {/* Home */}
              <Route
                path="/"
                element={
                  <Layout showSidebar={true}>
                    <HomePage />
                  </Layout>
                }
              />

              {/* Notifications */}
              <Route
                path="/notifications"
                element={
                  <Layout showSidebar={true}>
                    <NotificationsPage />
                  </Layout>
                }
              />

              {/* Chat */}
              <Route
                path="/chat/:id"
                element={
                  <Layout showSidebar={false}>
                    <ChatPage />
                  </Layout>
                }
              />

              {/* Video Call */}
              <Route path="/call/:id" element={<CallPage />} />

              {/* Unknown route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </StreamChatProvider>
         </StreamVideoProvider>
      ) : (
        <Routes>
          {/* Onboarding */}
          <Route
            path="/onboarding"
            element={
              isAuthenticated ? (
                !isOnboarded ? (
                  <OnboardingPage />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Login */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate
                  to={isOnboarded ? "/" : "/onboarding"}
                  replace
                />
              )
            }
          />

          {/* Signup */}
          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <SignupPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Unknown route */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  isAuthenticated
                    ? "/onboarding"
                    : "/login"
                }
                replace
              />
            }
          />
        </Routes>
      )}

      <Toaster position="top-right" />
    </div>
  );
}

export default App;