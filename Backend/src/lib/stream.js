import { StreamChat } from "stream-chat";

// 1. Export generateStreamToken
export const generateStreamToken = (userId) => {
  const apiKey = process.env.STREAM_API_KEY?.trim();
  const apiSecret = process.env.STREAM_API_SECRET?.trim();

  if (!apiKey || !apiSecret) {
    throw new Error(
      `STREAM CONFIG ERROR -> API Key present: ${!!apiKey}, API Secret present: ${!!apiSecret}`
    );
  }

  if (!userId) {
    throw new Error("STREAM CONFIG ERROR -> userId is undefined");
  }

  const serverClient = StreamChat.getInstance(apiKey, apiSecret);
  return serverClient.createToken(userId.toString());
};

// 2. Export upsertStreamUser (Missing export fixed here)
export const upsertStreamUser = async (userData) => {
  try {
    const apiKey = process.env.STREAM_API_KEY?.trim();
    const apiSecret = process.env.STREAM_API_SECRET?.trim();

    if (!apiKey || !apiSecret) {
      console.error("❌ STREAM_API_KEY or STREAM_API_SECRET is missing!");
      return;
    }

    if (!userData || (!userData.id && !userData._id)) {
      console.error("❌ Invalid user data passed to upsertStreamUser");
      return;
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    const userId = (userData.id || userData._id).toString();

    await serverClient.upsertUser({
      id: userId,
      name: userData.name || userData.fullName || "User",
      image: userData.image || userData.profilePic || userData.profilePicture || "",
    });

    console.log(`✅ Stream user upserted successfully: ${userId}`);
  } catch (error) {
    console.error("❌ Error upserting user in Stream:", error?.message || error);
  }
};