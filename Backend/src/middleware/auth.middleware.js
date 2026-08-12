import { StreamChat } from "stream-chat";

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

  // Create server instance
  const serverClient = StreamChat.getInstance(apiKey, apiSecret);
  return serverClient.createToken(userId.toString());
};

export const upsertStreamUser = async (userData) => {
  try {
    const apiKey = process.env.STREAM_API_KEY?.trim();
    const apiSecret = process.env.STREAM_API_SECRET?.trim();

    if (!apiKey || !apiSecret) {
      console.error("❌ STREAM_API_KEY or STREAM_API_SECRET is missing!");
      return;
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);

    await serverClient.upsertUser({
      id: userData.id.toString(),
      name: userData.name || userData.fullName || "User",
      image: userData.image || userData.profilePic || userData.profilePicture || "",
    });

    console.log(`✅ Stream user upserted: ${userData.id}`);
  } catch (error) {
    console.error("❌ Error upserting user in Stream:", error?.message || error);
  }
};