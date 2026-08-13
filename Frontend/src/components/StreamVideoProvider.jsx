import { useEffect, useState } from "react";

import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";

import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function StreamVideoProvider({ children }) {
  const { authUser } = useAuthUser();

  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!authUser?._id) {
      setClient(null);
      return;
    }

    let isMounted = true;
    let videoClient = null;

    const initializeClient = async () => {
      try {
        console.log("Initializing Global Stream Video Client...");

        if (!STREAM_API_KEY) {
          throw new Error(
            "VITE_STREAM_API_KEY is missing"
          );
        }

        const tokenData = await getStreamToken();

        if (!tokenData?.token) {
          throw new Error(
            "Stream token was not received from backend"
          );
        }

        if (!isMounted) {
          return;
        }

        const user = {
          id: authUser._id.toString(),
          name:
            authUser.fullName ||
            authUser.email ||
            "User",
          image:
            authUser.profilePicture ||
            "",
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        if (isMounted) {
          setClient(videoClient);
          console.log(
            "Global Stream Video client connected"
          );
        }
      } catch (error) {
        console.error(
          "Error initializing Stream Video client:",
          error
        );

        if (isMounted) {
          setClient(null);
        }
      }
    };

    initializeClient();

    return () => {
      isMounted = false;

      if (videoClient) {
        videoClient
          .disconnectUser()
          .catch((error) => {
            console.warn(
              "Error disconnecting Stream Video client:",
              error
            );
          });
      }
    };
  }, [authUser?._id]);

  if (!authUser) {
    return <>{children}</>;
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      {children}
    </StreamVideo>
  );
}