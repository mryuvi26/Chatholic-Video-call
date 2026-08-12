import { StreamChat } from "stream-chat";
import "dotenv/config";

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;

if (!api_key || !api_secret) {
  console.error("Stream API key and secret is missing");
}

const StreamClient = StreamChat.getInstance(api_key, api_secret);

export const upsertStreamUser = async (userData) => {
  try {
    await StreamClient.upsertUser(userData);
    return userData;
  } catch (error) {
    console.error("Error upserting user in Stream:", error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    return StreamClient.createToken(userId.toString());
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};