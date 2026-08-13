import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import { useStreamVideoClient } from "@stream-io/video-react-sdk";

import useAuthUser from "../hooks/useAuthUser";
import { useStreamChat } from "../components/StreamChatProvider";

import toast from "react-hot-toast";
import CallButton from "../components/CallButton";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();

  const authUser = useAuthUser().authUser;
  const chatClient = useStreamChat();
  const videoClient = useStreamVideoClient();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      !chatClient ||
      !authUser?._id ||
      !targetUserId
    ) {
      return;
    }

    let isCancelled = false;

    const initializeChannel = async () => {
      try {
        setLoading(true);

        console.log(
          "Initializing Stream Chat channel..."
        );

        const currentUserId =
          authUser._id.toString();

        const channelId = [
          currentUserId,
          targetUserId,
        ]
          .sort()
          .join("-");

        const currChannel = chatClient.channel(
          "messaging",
          channelId,
          {
            members: [
              currentUserId,
              targetUserId,
            ],
          }
        );

        await currChannel.watch();

        if (isCancelled) {
          return;
        }

        setChannel(currChannel);

        console.log(
          "Stream Chat channel connected successfully"
        );
      } catch (error) {
        console.error(
          "Error initializing chat channel:",
          error
        );

        if (!isCancelled) {
          toast.error(
            "Could not connect to chat."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    initializeChannel();

    return () => {
      isCancelled = true;
      setChannel(null);
    };
  }, [
    chatClient,
    authUser?._id,
    targetUserId,
  ]);

  const handleVideoCall = async () => {
    if (
      !videoClient ||
      !authUser?._id ||
      !targetUserId
    ) {
      toast.error(
        "Video call is not ready yet."
      );
      return;
    }

    try {
      console.log("Starting video call...");

      const callId = crypto.randomUUID();

      const call = videoClient.call(
        "default",
        callId
      );

      await call.getOrCreate({
        ring: true,
        video: true,
      });

      await call.updateCall({
        members: [
          {
            user_id: authUser._id.toString(),
          },
          {
            user_id: targetUserId.toString(),
          },
        ],
      });

      console.log(
        "Video call created successfully:",
        callId
      );

      navigate(`/call/${callId}`);
    } catch (error) {
      console.error(
        "Error starting video call:",
        error
      );

      toast.error(
        "Could not start video call."
      );
    }
  };

  if (
    loading ||
    !chatClient ||
    !channel
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <CallButton
        handleVideoCall={handleVideoCall}
      />

      <Chat
        client={chatClient}
        theme="str-chat__theme-dark"
      >
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