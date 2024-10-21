import mongoose from "mongoose";
import TrainSettings from "./trainSettingsModel.js";
import Station from "./stationModel.js";

const TrainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  journeyDate: {
    type: Date,
    required: true,
  },
  trainSettings: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TrainSettings",
  },
  stops: [
    {
      station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
      },
      arrivalTime: {
        type: Date,
        required: true,
      },
      departureTime: {
        type: Date,
        required: true,
      },
    },
  ],
});

const Train = mongoose.model("Train", TrainSchema);
export default Train;
