import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import admin from "./lib/firebase";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://admin-dasboard-persoanl.vercel.app"
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import userRoutes from "./routes/user.routes";
import projectsRoutes from "./routes/projects.routes";
import locationRoutes from "./routes/location.routes";

app.get("/", (req, res) => {
  res.json({ 
    message: "Admin API is running",
    environment: process.env.NODE_ENV,
    firebase: admin.apps.length > 0 ? "Initialized" : "FAILED"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/locations", locationRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('SERVER_ERROR:', err);
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: process.env.NODE_ENV === 'production' ? 'Refer to logs' : err.message 
  });
});

export default app;
