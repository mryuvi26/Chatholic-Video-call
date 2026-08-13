import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoute from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ES Module __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// Middleware
// =========================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// =========================
// API Routes
// =========================

app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// =========================
// Production Frontend
// =========================

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../../Frontend/dist");

  console.log("Serving frontend from:", distPath);

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// =========================
// Start Server
// =========================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();