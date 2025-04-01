import express from "express";
import dotenv from "dotenv";
import authRoutes from "../routes/auth.route.js";
import { connectDB } from "../config/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "../routes/message.route.js";
import cors from "cors";
import { app, server } from "../config/socket.js";
import path from "path";

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  connectDB();
  console.log(`running on port ${PORT}`);
});
