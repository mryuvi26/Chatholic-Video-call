import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import useAuthUser from "../hooks/useAuthUser";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();

  const { authUser, isLoading } =
    useAuthUser();

  const videoClient =
    useStreamVideoClient();

  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] =
    useState(true);

  useEffect(() => {
    if (
      isLoading ||
      !authUser ||
      !videoClient ||
      !callId
    ) {
      return;
    }

    let isCancelled = false;
    let callInstance = null;

    const initializeCall = async () => {
      try {
        console.log(
          "Initializing call:",
          callId
        );

        callInstance = videoClient.call(
          "default",
          callId
        );

        await callInstance.getOrCreate();

        if (isCancelled) {
          return;
        }

        setCall(callInstance);

        const currentState =
          callInstance.state.callingState;

        if (
          currentState !== CallingState.JOINED &&
          currentState !== CallingState.JOINING
        ) {
          console.log("Joining call...");

          await callInstance.join();
        }

        if (isCancelled) {
          await callInstance
            .leave()
            .catch(() => {});

          return;
        }

        setIsConnecting(false);

        console.log(
          "Successfully joined call:",
          callId
        );
      } catch (error) {
        console.error(
          "Error joining call:",
          error
        );

        if (!isCancelled) {
          toast.error(
            "Could not connect to the call."
          );

          setIsConnecting(false);

          navigate("/", {
            replace: true,
          });
        }
      }
    };

    initializeCall();

    return () => {
      isCancelled = true;

      if (callInstance) {
        callInstance
          .leave()
          .catch((error) =>
            console.warn(
              "Cleanup leave:",
              error
            )
          );
      }

      setCall(null);
    };
  }, [
    authUser?._id,
    videoClient,
    callId,
    isLoading,
    navigate,
  ]);

  if (
    isLoading ||
    isConnecting ||
    !call
  ) {
    return <PageLoader />;
  }

  return (
    <StreamCall call={call}>
      <CallContent />
    </StreamCall>
  );
};

const CallContent = () => {
  const navigate = useNavigate();
  const call = useCall();

  const {
    useCallCallingState,
    useParticipants,
  } = useCallStateHooks();

  const callingState =
    useCallCallingState();

  const participants =
    useParticipants();

  const [hasRemoteJoined, setHasRemoteJoined] =
    useState(false);

  const remoteParticipants =
    participants.filter(
      (participant) =>
        participant.userId !==
        call?.currentUserId
    );

  useEffect(() => {
    if (remoteParticipants.length > 0) {
      setHasRemoteJoined(true);
    }
  }, [remoteParticipants.length]);

  useEffect(() => {
    if (
      hasRemoteJoined &&
      remoteParticipants.length === 0
    ) {
      toast("Call ended by the other user.");

      call?.leave().catch(() => {});

      navigate("/", {
        replace: true,
      });
    }
  }, [
    hasRemoteJoined,
    remoteParticipants.length,
    call,
    navigate,
  ]);

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/", {
        replace: true,
      });
    }
  }, [callingState, navigate]);

  if (
    callingState === CallingState.RECONNECTING
  ) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h2 className="text-xl font-bold">
          Reconnecting...
        </h2>
      </div>
    );
  }

  if (
    callingState === CallingState.JOINING
  ) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (
    callingState === CallingState.JOINED
  ) {
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