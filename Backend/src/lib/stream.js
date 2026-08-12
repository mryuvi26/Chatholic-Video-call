import { StreamChat } from "stream-chat";

export const upsertStreamUser = async (userData) => {
  try {
    const apiKey = process.env.STREAM_API_KEY?.trim();
    const apiSecret = process.env.STREAM_API_SECRET?.trim();

    if (!apiKey || !apiSecret) {
      console.error("❌ STREAM_API_KEY or STREAM_API_SECRET is missing!");
      return;
    }

    const client = new StreamChat(apiKey, apiSecret);

    if (!userData || !userData.id) return;

    if (typeof client.upsertUser === "function") {
      await client.upsertUser(userData);
    } else if (typeof client.upsertUsers === "function") {
      await client.upsertUsers([userData]);
    }
  } catch (error) {
    console.error("Error upserting user in Stream:", error?.message || error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    const apiKey = process.env.STREAM_API_KEY?.trim();
    const apiSecret = process.env.STREAM_API_SECRET?.trim();

    if (!apiKey || !apiSecret) {
      throw new Error("STREAM_API_KEY or STREAM_API_SECRET missing");
    }

    if (!userId) {
      throw new Error("User ID is required to generate token");
    }

    const client = new StreamChat(apiKey, apiSecret);
    return client.createToken(userId.toString());
  } catch (error) {
    console.error("Error generating Stream token:", error?.message || error);
    throw error;
  }
};