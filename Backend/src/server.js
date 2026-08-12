import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import authRoute from "./routes/auth.route.js";
import userRoutes from './routes/user.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import chatRoutes from './routes/chat.route.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;

// Proper __dirname setup for ES Modules (points to Backend/src)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({  
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser()); // ROUTES SE PEHLE

app.use('/api/auth', authRoute);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

if (process.env.NODE_ENV === "production") {
    // Navigates: Backend/src -> Backend -> CHATBOT root -> Frontend/dist
    const distPath = path.join(__dirname, "../../Frontend/dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});