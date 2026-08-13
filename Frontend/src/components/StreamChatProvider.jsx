import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { StreamChat } from "stream-chat";

import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const StreamChatContext = createContext(null);

export function useStreamChat() {
  return useContext(StreamChatContext);
}

export default function StreamChatProvider({ children }) {
  const { authUser } = useAuthUser();

  const [client, setClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

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

        if (!STREAM_API_KEY) {
          throw new Error(
            "VITE_STREAM_API_KEY is missing"
          );
        }

        const tokenData = await getStreamToken();

        if (!tokenData?.token) {
          throw new Error(
            "Stream token was not received"
          );
        }

        const chatClient =
          StreamChat.getInstance(STREAM_API_KEY);

        // Disconnect previous user if necessary
        if (
          chatClient.userID &&
          chatClient.userID !== authUser._id.toString()
        ) {
          await chatClient.disconnectUser();
        }

        // Connect current user
        if (!chatClient.userID) {
          await chatClient.connectUser(
            {
              id: authUser._id.toString(),
              name:
                authUser.fullName ||
                authUser.email ||
                "User",
              image:
                authUser.profilePicture ||
                "",
            },
            tokenData.token
          );
        }

        if (!isMounted) {
          await chatClient.disconnectUser();
          return;
        }

        setClient(chatClient);

        console.log(
          "Global Stream Chat client connected"
        );
      } catch (error) {
        console.error(
          "Error initializing Stream Chat:",
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

      // Don't disconnect here on every component rerender.
      // The provider itself controls the connection.
    };
  }, [authUser?._id]);

  useEffect(() => {
    return () => {
      if (client) {
        client.disconnectUser().catch((error) => {
          console.warn(
            "Error disconnecting Stream Chat:",
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