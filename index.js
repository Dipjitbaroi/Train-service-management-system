import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoute.js";
import stationRoutes from "./routes/stationRoute.js";
import trainRoutes from "./routes/trainRoute.js";
import ticketRoutes from "./routes/ticketRoute.js";
import cron from "node-cron";
import { autoGenerateSchedule } from "./utility.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/tickets", ticketRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

cron.schedule(process.env.CORN_SCHEDULE, autoGenerateSchedule);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
