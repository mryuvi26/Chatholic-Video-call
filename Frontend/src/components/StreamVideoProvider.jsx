import { useEffect, useState } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function StreamVideoProvider({ children }) {
  const { authUser } = useAuthUser();
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!authUser?._id) {
      if (client) {
        client.disconnectUser().catch((err) =>
          console.warn("Error disconnecting video user:", err)
        );
        setClient(null);
      }
      return;
    }

    let isMounted = true;
    let videoClientInstance = null;

    const initStreamClient = async () => {
      try {
        const tokenData = await getStreamToken();
        if (!tokenData?.token || !isMounted) return;

        const user = {
          id: authUser._id.toString(),
          name: authUser.fullName || authUser.email || "User",
          image: authUser.profilePicture || authUser.profilePic || "",
        };

        // Bypass getOrCreateInstance cache by creating fresh instance
        videoClientInstance = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        if (isMounted) {
          setClient(videoClientInstance);
        }
      } catch (error) {
        console.error("Error initializing Stream Video client:", error);
      }
    };

    initStreamClient();

    return () => {
      isMounted = false;
      if (videoClientInstance) {
        videoClientInstance.disconnectUser().catch((err) =>
          console.warn("Error disconnecting video client on unmount:", err)
        );
      }
    };
  }, [authUser?._id]);

  if (!authUser) {
    return <>{children}</>;
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
}