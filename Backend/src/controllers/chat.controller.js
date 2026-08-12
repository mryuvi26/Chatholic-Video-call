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

    // 1. Ensure user profile exists in Stream DB before issuing token
    await upsertStreamUser({
      id: user._id.toString(),
      name: user.fullName,
      image: user.profilePicture || "",
    });

    // 2. Generate token with stringified MongoDB ID
    const streamToken = generateStreamToken(user._id.toString());

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