import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const user = req.user;

    const streamToken = generateStreamToken(user._id);

    res.status(200).json({
      success: true,
      token: streamToken,
    });
  } catch (error) {
    console.error("Error in getStreamToken controller:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}