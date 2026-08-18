
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

// ======================================================
// CALL PAGE
// ======================================================

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();

  const {
    authUser,
    isLoading,
  } = useAuthUser();

  const videoClient =
    useStreamVideoClient();

  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] =
    useState(true);

  // ====================================================
  // INITIALIZE CALL
  // ====================================================

  useEffect(() => {
    if (
      isLoading ||
      !authUser ||
      !videoClient ||
      !callId
    ) {
      return;
    }

    let cancelled = false;
    let callInstance = null;

    const initializeCall = async () => {
      try {
        console.log(
          "Initializing call:",
          callId
        );

        // ----------------------------------------------
        // CREATE CALL INSTANCE
        // ----------------------------------------------

        callInstance = videoClient.call(
          "default",
          callId
        );

        if (cancelled) {
          return;
        }

        setCall(callInstance);

        // ----------------------------------------------
        // CHECK CURRENT STATE
        // ----------------------------------------------

        const currentState =
          callInstance.state.callingState;

        console.log(
          "Current call state:",
          currentState
        );

        // ----------------------------------------------
        // JOIN ONLY IF NECESSARY
        // ----------------------------------------------

        if (
          currentState !== CallingState.JOINED &&
          currentState !== CallingState.JOINING
        ) {
          console.log(
            "Joining call..."
          );

          await callInstance.join();

          console.log(
            "Successfully joined call:",
            callId
          );
        } else {
          console.log(
            "Already joining/joined call:",
            currentState
          );
        }

        if (cancelled) {
          return;
        }

        setIsConnecting(false);

      } catch (error) {
        console.error(
          "Error joining call:",
          error
        );

        if (!cancelled) {
          setIsConnecting(false);

          toast.error(
            "Could not connect to the call."
          );

          navigate("/", {
            replace: true,
          });
        }
      }
    };

    initializeCall();

    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {
      cancelled = true;

      console.log(
        "CallPage cleanup."
      );

      /*
       * IMPORTANT:
       *
       * We leave the call ONLY from CallPage.
       *
       * IncomingCall never joins the call.
       */

      if (callInstance) {
        const state =
          callInstance.state.callingState;

        console.log(
          "Call cleanup state:",
          state
        );

        if (
          state !== CallingState.LEFT &&
          state !== CallingState.IDLE
        ) {
          callInstance
            .leave()
            .catch((error) => {
              console.error(
                "Error leaving call:",
                error
              );
            });
        }
      }
    };

  }, [
    authUser?._id,
    videoClient,
    callId,
    isLoading,
    navigate,
  ]);

  // ====================================================
  // LOADING
  // ====================================================

  if (
    isLoading ||
    isConnecting ||
    !call
  ) {
    return <PageLoader />;
  }

  // ====================================================
  // CALL
  // ====================================================

  return (
    <StreamCall call={call}>
      <CallContent />
    </StreamCall>
  );
};

// ======================================================
// CALL CONTENT
// ======================================================

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

  const [
    hasRemoteJoined,
    setHasRemoteJoined,
  ] = useState(false);

  // ====================================================
  // DEBUG PARTICIPANTS
  // ====================================================

  useEffect(() => {
    console.log(
      "========== CALL PARTICIPANTS =========="
    );

    console.table(
      participants.map((participant) => ({
        userId: participant.userId,
        sessionId: participant.sessionId,
        name:
          participant.name ||
          participant.user?.name ||
          "Unknown",
        isLocal:
          participant.userId ===
          call?.currentUserId,
      }))
    );

    console.log(
      "Current User:",
      call?.currentUserId
    );

    console.log(
      "Total Participants:",
      participants.length
    );

    const uniqueUsers =
      new Set(
        participants.map(
          (participant) =>
            participant.userId
        )
      );

    const uniqueSessions =
      new Set(
        participants.map(
          (participant) =>
            participant.sessionId
        )
      );

    console.log(
      "Unique Users:",
      uniqueUsers.size
    );

    console.log(
      "Unique Sessions:",
      uniqueSessions.size
    );
  }, [
    participants,
    call,
  ]);

  // ====================================================
  // REMOTE PARTICIPANTS
  // ====================================================

  const remoteParticipants =
    participants.filter(
      (participant) =>
        participant.userId !==
        call?.currentUserId
    );

  // ====================================================
  // DETECT REMOTE USER
  // ====================================================

  useEffect(() => {
    if (
      remoteParticipants.length > 0
    ) {
      setHasRemoteJoined(true);
    }
  }, [
    remoteParticipants.length,
  ]);

  // ====================================================
  // REMOTE USER LEFT
  // ====================================================

  useEffect(() => {
    if (
      hasRemoteJoined &&
      remoteParticipants.length === 0 &&
      callingState === CallingState.JOINED
    ) {
      console.log(
        "Remote participant left the call."
      );

      toast(
        "Call ended by the other user."
      );

      navigate("/", {
        replace: true,
      });
    }
  }, [
    hasRemoteJoined,
    remoteParticipants.length,
    callingState,
    navigate,
  ]);

  // ====================================================
  // LOCAL USER LEFT
  // ====================================================

  useEffect(() => {
    if (
      callingState === CallingState.LEFT
    ) {
      console.log(
        "Local user left the call."
      );

      navigate("/", {
        replace: true,
      });
    }
  }, [
    callingState,
    navigate,
  ]);

  // ====================================================
  // RECONNECTING
  // ====================================================

  if (
    callingState ===
    CallingState.RECONNECTING
  ) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h2 className="text-xl font-bold">
          Reconnecting...
        </h2>
      </div>
    );
  }

  // ====================================================
  // JOINING
  // ====================================================

  if (
    callingState ===
    CallingState.JOINING
  ) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  // ====================================================
  // JOINED
  // ====================================================

  if (
    callingState ===
    CallingState.JOINED
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

