import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  useCall,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();

  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();
  const videoClient = useStreamVideoClient();

  const { data: tokenData, isLoading: isTokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (
      isLoading ||
      isTokenLoading ||
      !authUser ||
      !tokenData?.token ||
      !videoClient ||
      !callId
    ) {
      return;
    }

    let callInstance = null;
    let isCancelled = false;

    const initCall = async () => {
      try {
        console.log("Initializing call:", callId);

        callInstance = videoClient.call("default", callId);
        await callInstance.getOrCreate();

        if (isCancelled) return;

        const currentState = callInstance.state.callingState;
        setCall(callInstance);

        // Sirf tab join karo agar pehle se joined nahi hai
        if (
          currentState !== CallingState.JOINED &&
          currentState !== CallingState.JOINING
        ) {
          console.log("Joining call...");
          await callInstance.join();
        }

        if (isCancelled) {
          await callInstance.leave().catch(() => {});
          return;
        }

        setIsConnecting(false);
      } catch (error) {
        console.error("Error joining call:", error);
        if (!isCancelled) {
          toast.error("Could not connect to the call.");
          setIsConnecting(false);
          navigate("/", { replace: true });
        }
      }
    };

    initCall();

    return () => {
      isCancelled = true;
      if (callInstance) {
        callInstance.leave().catch((err) => console.warn("Cleanup leave:", err));
      }
      setCall(null);
    };
  }, [
    authUser,
    tokenData,
    callId,
    videoClient,
    isLoading,
    isTokenLoading,
    navigate,
  ]);

  if (isLoading || isTokenLoading || isConnecting || !call) {
    return <PageLoader />;
  }

  return (
    <StreamCall call={call}>
      <CallContent />
    </StreamCall>
  );
};

/*
 * ============================================
 * CALL CONTENT (Handles UI & Real-time exit)
 * ============================================
 */

const CallContent = () => {
  const navigate = useNavigate();
  const call = useCall();

  const [hasRemoteJoined, setHasRemoteJoined] = useState(false);

  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();

  // Current user ko chhod kar baki remote users
  const remoteParticipants = participants.filter(
    (participant) => participant.userId !== call?.currentUserId
  );

  // 1. Remote user join tracking
  useEffect(() => {
    if (remoteParticipants.length > 0) {
      setHasRemoteJoined(true);
    }
  }, [remoteParticipants.length]);

  // 2. AUTO-EXIT: Jab remote user join karke chala jaye
  useEffect(() => {
    if (hasRemoteJoined && remoteParticipants.length === 0) {
      toast("Call ended by the other user.");
      call?.leave().catch(() => {});
      navigate("/", { replace: true });
    }
  }, [hasRemoteJoined, remoteParticipants.length, navigate, call]);

  // 3. Red "End Call" buttonya regular leave par auto-redirect
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/", { replace: true });
    }
  }, [callingState, navigate]);

  if (callingState === CallingState.RECONNECTING) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h2 className="text-xl font-bold">Reconnecting...</h2>
      </div>
    );
  }

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (callingState === CallingState.JOINED) {
    return (
      <StreamTheme>
        <div className="h-screen w-full bg-base-300 relative">
          <SpeakerLayout />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
            <CallControls />
          </div>
        </div>
      </StreamTheme>
    );
  }

  return null;
};

export default CallPage;