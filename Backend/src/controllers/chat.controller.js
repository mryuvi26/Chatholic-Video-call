import {
  generateStreamChatToken,
  generateStreamVideoToken,
} from "../lib/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const chatToken = generateStreamChatToken(userId);
    const videoToken = generateStreamVideoToken(userId);

    res.status(200).json({
      success: true,
      chatToken,
      videoToken,
    });
  } catch (error) {
    console.error("Stream token error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate Stream tokens",
    });
  }
};