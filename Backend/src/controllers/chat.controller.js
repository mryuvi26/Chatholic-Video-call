import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    console.log("=== GET STREAM TOKEN REQUEST RECEIVED ===");
    console.log("Auth User ID:", req.user?._id?.toString());

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User details not found in request",
      });
    }

    const userId = req.user._id.toString();
    const token = generateStreamToken(userId);

    console.log("✅ Token successfully generated for user:", userId);

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("🔥 CRITICAL 500 ERROR IN getStreamToken:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate stream token",
    });
  }
}