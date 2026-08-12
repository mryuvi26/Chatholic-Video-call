import { axiosInstance } from "./axios.js";

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
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }

    console.error("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post(
    "/auth/onboarding",
    userData
  );

  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");

  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");

  return response.data.users;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get(
    "/users/outgoing-friend-requests"
  );

  return response.data.outgoingRequests;
}

export async function sendFriendRequest(userID) {
  const response = await axiosInstance.post(
    `/users/friend-request/${userID}`
  );

  return response.data;
}

export async function acceptFriendRequest(requestID) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestID}/accept`
  );

  return response.data;
}

export async function rejectFriendRequest(requestID) {
  const response = await axiosInstance.post(
    `/users/friend-requests/${requestID}/reject`
  );

  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");

  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get(
    "/users/friend-requests"
  );

  return response.data;
}