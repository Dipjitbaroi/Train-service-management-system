import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoute.js";
import stationRoutes from "./routes/stationRoute.js";
import trainRoutes from "./routes/trainRoute.js";
// import walletRoutes from './routes/walletRoute.js';
import ticketRoutes from "./routes/ticketRoute.js";
import cron from "node-cron";
import { autoGenerateSchedule } from "./utility.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/trains", trainRoutes);
// app.use('/api/wallet', walletRoutes);
app.use("/api/tickets", ticketRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

cron.schedule(process.env.CORN_SCHEDULE, autoGenerateSchedule);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
