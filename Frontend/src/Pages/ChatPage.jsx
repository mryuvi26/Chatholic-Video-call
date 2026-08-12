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

import {
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";

import toast from "react-hot-toast";

import CallButton from "../components/CallButton";

import "stream-chat-react/dist/css/index.css";

const STREAM_API_KEY =
  import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const navigate = useNavigate();

  const [chatClient, setChatClient] =
    useState(null);

  const [channel, setChannel] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const { authUser } =
    useAuthUser();

  /*
   * Global Stream Video Client
   */
  const videoClient =
    useStreamVideoClient();

  const {
    data: tokenData,
    isLoading: isTokenLoading,
  } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  /*
   * Initialize Stream Chat
   */
  useEffect(() => {
    if (
      !tokenData?.token ||
      !authUser ||
      !targetUserId
    ) {
      return;
    }

    let isCancelled = false;

    const initChat = async () => {
      try {
        console.log(
          "Initializing Stream Chat..."
        );

        const client =
          StreamChat.getInstance(
            STREAM_API_KEY
          );

        /*
         * Connect only once.
         */
        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            tokenData.token
          );
        }

        if (isCancelled) {
          return;
        }

        const channelId = [
          authUser._id,
          targetUserId,
        ]
          .sort()
          .join("-");

        console.log(
          "Channel ID:",
          channelId
        );

        const currChannel =
          client.channel(
            "messaging",
            channelId,
            {
              members: [
                authUser._id,
                targetUserId,
              ],
            }
          );

        await currChannel.watch();

        if (isCancelled) {
          return;
        }

        setChatClient(client);
        setChannel(currChannel);

        console.log(
          "Stream Chat connected successfully"
        );
      } catch (error) {
        console.error(
          "Error initializing chat:",
          error
        );

        toast.error(
          "Could not connect to chat."
        );
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    initChat();

    return () => {
      isCancelled = true;
    };
  }, [
    tokenData,
    authUser,
    targetUserId,
  ]);

  /*
   * Start Video Call
   */
  const handleVideoCall = async () => {
    if (
      !videoClient ||
      !authUser ||
      !targetUserId
    ) {
      toast.error(
        "Video call is not ready yet."
      );

      return;
    }

    try {
      console.log(
        "Starting video call..."
      );

      /*
       * Every call MUST have
       * a new unique ID.
       */
      const callId =
        crypto.randomUUID();

      console.log(
        "Call ID:",
        callId
      );

      const call =
        videoClient.call(
          "default",
          callId
        );

      /*
       * IMPORTANT:
       *
       * Caller is included in members.
       *
       * Caller does NOT call join().
       *
       * Stream automatically joins the
       * caller after callee accepts.
       */
      await call.getOrCreate({
        ring: true,
        video: true,

        data: {
          members: [
            {
              user_id:
                authUser._id,
            },
            {
              user_id:
                targetUserId,
            },
          ],
        },
      });

      console.log(
        "Video call created successfully"
      );

      /*
       * Open CallPage.
       *
       * Caller will see "Calling..."
       * until receiver accepts.
       */
      navigate(
        `/call/${callId}`
      );

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

  /*
   * Loading
   */
  if (
    loading ||
    isTokenLoading ||
    !chatClient ||
    !channel
  ) {
    return null;
  }

  return (
    <div className="relative">

      <CallButton
        handleVideoCall={
          handleVideoCall
        }
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