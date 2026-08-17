import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { StreamChat } from "stream-chat";

import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY =
  import.meta.env.VITE_STREAM_API_KEY;

const StreamChatContext = createContext(null);

export function useStreamChat() {
  return useContext(StreamChatContext);
}

export default function StreamChatProvider({
  children,
}) {
  const { authUser } = useAuthUser();

  const [client, setClient] = useState(null);
  const [isConnecting, setIsConnecting] =
    useState(true);

  useEffect(() => {
    if (!authUser?._id) {
      setClient(null);
      setIsConnecting(false);
      return;
    }

    let isMounted = true;

    const initializeChat = async () => {
      try {
        setIsConnecting(true);

        console.log(
          "Initializing Global Stream Chat Client..."
        );

        console.log(
          "CHAT API KEY:",
          STREAM_API_KEY
        );

        if (!STREAM_API_KEY) {
          throw new Error(
            "VITE_STREAM_API_KEY is missing"
          );
        }

        const tokenData =
          await getStreamToken();

        console.log(
          "CHAT TOKEN RECEIVED:",
          !!tokenData?.chatToken
        );

        if (!tokenData?.chatToken) {
          throw new Error(
            "Stream Chat token was not received"
          );
        }

        const userId =
          authUser._id.toString();

        const chatClient =
          StreamChat.getInstance(
            STREAM_API_KEY
          );

        if (
          chatClient.userID &&
          chatClient.userID !== userId
        ) {
          await chatClient.disconnectUser();
        }

        if (!chatClient.userID) {
          await chatClient.connectUser(
            {
              id: userId,
              name:
                authUser.fullName ||
                authUser.email ||
                "User",
              image:
                authUser.profilePicture ||
                "",
            },
            tokenData.chatToken
          );
        }

        if (!isMounted) {
          await chatClient.disconnectUser();
          return;
        }

        setClient(chatClient);

        console.log(
          "✅ Global Stream Chat client connected"
        );
      } catch (error) {
        console.error(
          "❌ Error initializing Stream Chat:",
          error
        );

        if (isMounted) {
          setClient(null);
        }
      } finally {
        if (isMounted) {
          setIsConnecting(false);
        }
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
    };
  }, [authUser?._id]);

  useEffect(() => {
    return () => {
      if (client) {
        client
          .disconnectUser()
          .catch((error) => {
            console.warn(
              "Stream Chat disconnect error:",
              error
            );
          });
      }
    };
  }, [client]);

  if (!authUser) {
    return <>{children}</>;
  }

  if (isConnecting || !client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <StreamChatContext.Provider value={client}>
      {children}
    </StreamChatContext.Provider>
  );
}