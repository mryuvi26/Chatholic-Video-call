import { StreamChat } from "stream-chat";

export const upsertStreamUser = async (userData) => {
  try {
    const apiKey = process.env.STREAM_API_KEY?.trim();
    const apiSecret = process.env.STREAM_API_SECRET?.trim();

    if (!apiKey || !apiSecret) {
      console.error("❌ STREAM_API_KEY or STREAM_API_SECRET is missing!");
      return;
    }

    // Use getInstance instead of new StreamChat
    const client = StreamChat.getInstance(apiKey, apiSecret);

    if (!userData || !userData.id) {
      console.error("❌ Invalid user data provided to upsertStreamUser");
      return;
    }

    // Direct upsert user in Stream Chat
    await client.upsertUser({
      id: userData.id.toString(),
      name: userData.name || userData.fullName || "User",
      image: userData.image || userData.profilePic || userData.profilePicture || "",
    });

    console.log(`✅ Stream user upserted: ${userData.id}`);
  } catch (error) {
    console.error("❌ Error upserting user in Stream:", error?.message || error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    const apiKey = process.env.STREAM_API_KEY?.trim();
    const apiSecret = process.env.STREAM_API_SECRET?.trim();

    if (!apiKey || !apiSecret) {
      throw new Error("STREAM_API_KEY or STREAM_API_SECRET is missing in environment variables!");
    }

    if (!userId) {
      throw new Error("User ID is required to generate token!");
    }

    // Use getInstance for server-side token generation
    const client = StreamChat.getInstance(apiKey, apiSecret);
    return client.createToken(userId.toString());
  } catch (error) {
    console.error("❌ Error generating Stream token:", error?.message || error);
    throw error;
  }
};