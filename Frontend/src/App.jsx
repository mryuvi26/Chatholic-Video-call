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

import { useThemeStore } from "./Store/useThemeStore.js";

import PageLoader from "./components/PageLoader.jsx";

import StreamVideoProvider from "./components/StreamVideoProvider";
import IncomingCall from "./components/Incomingcall";

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
      {/* Stream Video Provider ONLY initialized when user is authenticated & onboarded */}
      {isAuthenticated && isOnboarded ? (
        <StreamVideoProvider>
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

            {/* Catch-all redirect for authenticated onboarded user */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </StreamVideoProvider>
      ) : (
        /* Unauthenticated or Non-onboarded Routes */
        <Routes>
          <Route
            path="/onboarding"
            element={
              isAuthenticated ? (
                !isOnboarded ? (
                  <OnboardingPage />
                ) : (
                  <Navigate to="/" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} />
              )
            }
          />

          <Route
            path="/signup"
            element={
              !isAuthenticated ? <SignupPage /> : <Navigate to="/" />
            }
          />

          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
            }
          />
        </Routes>
      )}

      <Toaster />
    </div>
  );
}

export default App;