import { useEffect, useState } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default function StreamVideoProvider({ children }) {
  const { authUser } = useAuthUser();
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!authUser) {
      if (client) {
        client.disconnectUser();
        setClient(null);
      }
      return;
    }

    // Agar client pehle se bana hua hai, toh dobara mat banao
    if (client) return;

    let isMounted = true;

    const initStreamClient = async () => {
      try {
        const tokenData = await getStreamToken();
        if (!tokenData?.token || !isMounted) return;

        const user = {
          id: authUser._id || authUser.id,
          name: authUser.fullName || authUser.name || "User",
          image: authUser.profilePic || "",
        };

        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        if (isMounted) {
          setClient(streamClient);
        }
      } catch (error) {
        console.error("Error initializing Stream client:", error);
      }
    };

    initStreamClient();

    return () => {
      isMounted = false;
    };
  }, [authUser?._id]); // YEH MAIN FIX HAI: Sirf User ID badalne par hi re-run hoga

  if (!authUser) {
    return <>{children}</>;
  }

  if (!client) {
    return null; // Token fetch hone tak clean hold
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
}