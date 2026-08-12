import { StreamChat } from "stream-chat";

const getStreamClient = () => {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error("❌ STREAM_API_KEY or STREAM_API_SECRET is missing in process.env!");
    throw new Error("Stream credentials missing");
  }

  // StreamChat.getInstance automatically handles instance caching cleanly
  return StreamChat.getInstance(apiKey, apiSecret);
};

export const upsertStreamUser = async (userData) => {
  try {
    const client = getStreamClient();
    
    // Safety check to prevent invalid user objects from sending
    if (!userData || !userData.id) {
      console.warn("⚠️ Invalid userData passed to upsertStreamUser");
      return;
    }

    // Handles both upsertUser and upsertUsers methods across different SDK versions
    if (typeof client.upsertUser === "function") {
      await client.upsertUser(userData);
    } else if (typeof client.upsertUsers === "function") {
      await client.upsertUsers([userData]);
    }
    return userData;
  } catch (error) {
    console.error("Error upserting user in Stream:", error?.message || error);
    // Non-blocking error so token generation doesn't crash with 500
  }
};

export const generateStreamToken = (userId) => {
  try {
    const client = getStreamClient();
    if (!userId) throw new Error("User ID is required to generate token");

    return client.createToken(userId.toString());
  } catch (error) {
    console.error("Error generating Stream token:", error?.message || error);
    throw error;
  }
};