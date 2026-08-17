import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("Stream API key or secret is missing");
}

// ================================
// CHAT SERVER CLIENT
// ================================
export const streamChatClient = StreamChat.getInstance(
  apiKey,
  apiSecret
);

// ================================
// VIDEO SERVER CLIENT
// ================================
export const streamVideoClient = new StreamClient(
  apiKey,
  apiSecret
);

// ================================
// STREAM USER UPSERT
// ================================
export const upsertStreamUser = async (user) => {
  try {
    await streamChatClient.upsertUser({
      id: user.id || user._id.toString(),
      name:
        user.name ||
        user.fullName ||
        user.email ||
        "User",
      image:
        user.image ||
        user.profilePicture ||
        "",
    });

    console.log(
      "✅ Stream user upserted:",
      user.id || user._id.toString()
    );
  } catch (error) {
    console.error(
      "❌ Stream user upsert error:",
      error
    );
    throw error;
  }
};

// ================================
// CHAT TOKEN
// ================================
export const generateStreamChatToken = (userId) => {
  return streamChatClient.createToken(userId.toString());
};

// ================================
// VIDEO TOKEN
// ================================
export const generateStreamVideoToken = (userId) => {
  return streamVideoClient.generateUserToken({
    user_id: userId.toString(),
  });
};