import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoute";

// middlewares 
import { authenticate } from "./middlewares/authMiddleware";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello TypeScript Backend!");
});

app.use("/api/auth/", authRoutes);

app.get("/api/profile", authenticate, (req, res) => {
  return res.send("Your Profile");
});

export default app;
