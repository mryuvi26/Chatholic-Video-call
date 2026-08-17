import { axiosInstance } from "./axios.js";

// ================================
// AUTH
// ================================

export const signup = async (signupData) => {
  const response = await axiosInstance.post(
    "/auth/signup",
    signupData
  );

  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post(
    "/auth/login",
    loginData
  );

  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post(
    "/auth/logout"
  );

  return response.data;
};

export const getAuthUser = async () => {
  try {
    const response =
      await axiosInstance.get("/auth/me");

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }

    console.error(
      "Error in getAuthUser:",
      error
    );

    return null;
  }
};

export const completeOnboarding = async (
  userData
) => {
  const response =
    await axiosInstance.post(
      "/auth/onboarding",
      userData
    );

  return response.data;
};

// ================================
// USERS
// ================================

export const getUserFriends = async () => {
  const response =
    await axiosInstance.get(
      "/users/friends"
    );

  return response.data;
};

export const getRecommendedUsers =
  async () => {
    const response =
      await axiosInstance.get("/users");

    return response.data.users;
  };

export const getOutgoingFriendReqs =
  async () => {
    const response =
      await axiosInstance.get(
        "/users/outgoing-friend-requests"
      );

    return response.data.outgoingRequests;
  };

export const sendFriendRequest = async (
  userID
) => {
  const response =
    await axiosInstance.post(
      `/users/friend-request/${userID}`
    );

  return response.data;
};

export const acceptFriendRequest =
  async (requestID) => {
    const response =
      await axiosInstance.put(
        `/users/friend-request/${requestID}/accept`
      );

    return response.data;
  };

export const getFriendRequests =
  async () => {
    const response =
      await axiosInstance.get(
        "/users/friend-requests"
      );

    return response.data;
  };

// ================================
// STREAM
// ================================

export const getStreamToken = async () => {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
};