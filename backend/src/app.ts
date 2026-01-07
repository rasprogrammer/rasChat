import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoute";
import userRoutes from "./routes/userRoute";
import conversationRoutes from "./routes/conversationRoute";

// middlewares 
import { authenticate } from "./middlewares/authMiddleware";


const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello TypeScript Backend!");
});

app.use("/api/auth/", authRoutes);
app.use("/api", authenticate, userRoutes);
app.use("/api/conversations", authenticate, conversationRoutes);

app.get("/api/profile", authenticate, (req, res) => {
  return res.send("Your Profile");
});

export default app;
