import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import { StreamChat } from "stream-chat";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";
import CallButton from "../components/CallButton";

import "stream-chat-react/dist/css/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();
  const videoClient = useStreamVideoClient();

  const { data: tokenData, isLoading: isTokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  /*
   * Initialize Stream Chat safely with disconnection cleanup
   */
  useEffect(() => {
    if (!tokenData?.token || !authUser?._id || !targetUserId) {
      return;
    }

    let isCancelled = false;
    let clientInstance = null;

    const initChat = async () => {
      try {
        console.log("Initializing Stream Chat...");

        clientInstance = StreamChat.getInstance(STREAM_API_KEY);

        // If client is connected to a different user, disconnect first
        if (clientInstance.userID && clientInstance.userID !== authUser._id) {
          await clientInstance.disconnectUser();
        }

        // Connect user if not already connected
        if (!clientInstance.userID) {
          await clientInstance.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName || authUser.email,
              image: authUser.profilePicture || authUser.profilePic || "",
            },
            tokenData.token
          );
        }

        if (isCancelled) return;

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = clientInstance.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        if (isCancelled) return;

        setChatClient(clientInstance);
        setChannel(currChannel);

        console.log("Stream Chat connected successfully");
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat.");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    initChat();

    // CLEANUP: Disconnect user on unmount to prevent stale token reuse
    return () => {
      isCancelled = true;
      if (clientInstance) {
        clientInstance.disconnectUser().catch((err) =>
          console.warn("Error disconnecting stream chat user:", err)
        );
      }
    };
  }, [tokenData, authUser, targetUserId]);

  /*
   * Start Video Call
   */
  const handleVideoCall = async () => {
    if (!videoClient || !authUser || !targetUserId) {
      toast.error("Video call is not ready yet.");
      return;
    }

    try {
      console.log("Starting video call...");
      const callId = crypto.randomUUID();

      const call = videoClient.call("default", callId);

      await call.getOrCreate({
        ring: true,
        video: true,
        data: {
          members: [
            { user_id: authUser._id },
            { user_id: targetUserId },
          ],
        },
      });

      console.log("Video call created successfully");
      navigate(`/call/${callId}`);
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Could not start video call.");
    }
  };

  if (loading || isTokenLoading || !chatClient || !channel) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="relative">
      <CallButton handleVideoCall={handleVideoCall} />

      <Chat client={chatClient} theme="str-chat__theme-dark">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageComposer />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;