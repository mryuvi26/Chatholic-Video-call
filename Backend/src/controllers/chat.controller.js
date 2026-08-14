import { generateStreamChatToken } from "../lib/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const token = generateStreamChatToken(userId);

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Stream chat token error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate Stream Chat token",
    });
  }
};