import { StreamChat } from "stream-chat";

export const generateStreamToken = (userId) => {
  try {
    const apiKey = process.env.STREAM_API_KEY?.trim();
    const apiSecret = process.env.STREAM_API_SECRET?.trim();

    if (!apiKey) {
      throw new Error("STREAM_API_KEY is missing in process.env");
    }
    if (!apiSecret) {
      throw new Error("STREAM_API_SECRET is missing in process.env");
    }
    if (!userId) {
      throw new Error("userId parameter is missing for token generation");
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    return serverClient.createToken(userId.toString());
  } catch (error) {
    console.error("❌ Error inside generateStreamToken:", error.message || error);
    throw error;
  }
};