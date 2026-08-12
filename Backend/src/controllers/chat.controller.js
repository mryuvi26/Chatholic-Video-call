import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User context missing",
      });
    }

    // 1. Sync user profile with Stream (non-blocking)
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName || user.email || "User",
        image: user.profilePicture || "",
      });
    } catch (upsertErr) {
      console.warn("Stream user upsert non-critical failure:", upsertErr?.message || upsertErr);
    }

    // 2. Generate Stream Token
    const streamToken = generateStreamToken(user._id.toString());

    return res.status(200).json({
      success: true,
      token: streamToken,
    });
  } catch (error) {
    console.error("Error in getStreamToken controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error generating token",
    });
  }
}