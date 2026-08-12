import { StreamChat } from "stream-chat";

// Helper function to lazily initialize Stream Client with live env variables
const getStreamClient = () => {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error("❌ CRITICAL: STREAM_API_KEY or STREAM_API_SECRET is missing in process.env!");
    throw new Error("Stream credentials missing");
  }

  // Using 'new StreamChat' guarantees fresh binding with exact keys
  return new StreamChat(apiKey, apiSecret);
};

export const upsertStreamUser = async (userData) => {
  try {
    const client = getStreamClient();
    await client.upsertUser(userData);
    return userData;
  } catch (error) {
    console.error("Error upserting user in Stream:", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    const client = getStreamClient();
    if (!userId) throw new Error("User ID is required to generate token");
    
    return client.createToken(userId.toString());
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};