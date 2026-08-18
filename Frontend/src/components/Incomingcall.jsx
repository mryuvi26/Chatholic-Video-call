
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CallingState,
  useCalls,
} from "@stream-io/video-react-sdk";

import {
  VideoIcon,
  Phone,
  PhoneOff,
} from "lucide-react";

const IncomingCall = () => {
  const navigate = useNavigate();

  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const calls = useCalls();

  /*
   * Find only calls:
   * - created by another user
   * - currently ringing
   */
  const incomingCalls = calls.filter(
    (call) =>
      call.isCreatedByMe === false &&
      call.state.callingState === CallingState.RINGING
  );

  /*
   * We only show one incoming call.
   */
  const incomingCall = incomingCalls[0];

  if (!incomingCall) {
    return null;
  }

  // =========================
  // ACCEPT CALL
  // =========================

  const handleAccept = () => {
    if (isAccepting || isRejecting) return;

    try {
      setIsAccepting(true);

      console.log(
        "Accepting incoming video call:",
        incomingCall.id
      );

      /*
       * IMPORTANT:
       *
       * Do NOT call incomingCall.join() here.
       *
       * CallPage will create the call instance and join it.
       *
       * This prevents two different components from
       * trying to join the same call.
       */

      navigate(`/call/${incomingCall.id}`, {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Error accepting incoming call:",
        error
      );

      setIsAccepting(false);
    }
  };

  // =========================
  // REJECT CALL
  // =========================

  const handleReject = async () => {
    if (isAccepting || isRejecting) return;

    try {
      setIsRejecting(true);

      console.log(
        "Rejecting incoming video call:",
        incomingCall.id
      );

      /*
       * Reject only.
       *
       * We do NOT navigate to CallPage.
       */
      await incomingCall.leave({
        reject: true,
        reason: "decline",
      });

      console.log(
        "Incoming call rejected successfully"
      );
    } catch (error) {
      console.error(
        "Error rejecting incoming call:",
        error
      );
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-90 max-w-[90%] rounded-2xl bg-base-200 p-8 shadow-2xl">

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center animate-pulse">
            <VideoIcon className="w-10 h-10 text-success" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center">
          Incoming Video Call
        </h2>

        <p className="text-center opacity-70 mt-2">
          Someone is calling you...
        </p>

        <p className="text-center text-sm opacity-60 mt-4">
          Video call
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-5 mt-8">

          {/* Reject */}
          <button
            onClick={handleReject}
            disabled={isAccepting || isRejecting}
            className="btn btn-error text-white rounded-full px-6"
          >
            <PhoneOff className="w-5 h-5" />

            {isRejecting
              ? "Rejecting..."
              : "Reject"}
          </button>

          {/* Accept */}
          <button
            onClick={handleAccept}
            disabled={isAccepting || isRejecting}
            className="btn btn-success text-white rounded-full px-6"
          >
            <Phone className="w-5 h-5" />

            {isAccepting
              ? "Connecting..."
              : "Accept"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default IncomingCall;

