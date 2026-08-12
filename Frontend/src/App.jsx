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
import IncomingCall from "./components/IncomingCall";

function App() {
  const { authUser, isLoading } = useAuthUser();
  const { theme } = useThemeStore();

  if (isLoading) {
    return <PageLoader />;
  }

  const isAuthenticated = !!authUser;
  const isOnboarded = authUser?.isOnboarded;

  return (
    <StreamVideoProvider>
      <div data-theme={theme}>
        {/* Global incoming call handler */}
        {isAuthenticated && isOnboarded && <IncomingCall />}

        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                isOnboarded ? (
                  <Layout showSidebar={true}>
                    <HomePage />
                  </Layout>
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <NotificationsPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          {/* Chat */}
          <Route
            path="/chat/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={false}>
                  <ChatPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          {/* Video Call */}
          <Route
            path="/call/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <CallPage />
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          {/* Onboarding */}
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

          {/* Login */}
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

          {/* Signup */}
          <Route
            path="/signup"
            element={
              !isAuthenticated ? <SignupPage /> : <Navigate to="/" />
            }
          />
        </Routes>

        <Toaster />
      </div>
    </StreamVideoProvider>
  );
}

export default App;