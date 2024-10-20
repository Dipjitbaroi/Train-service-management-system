import mongoose from "mongoose";

const TrainSettingsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  origin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
  },
  totalDistance: {
    type: Number,
    required: true,
  },
  perKMTicketCost: {
    type: Number,
    required: true,
  },
  stops: [
    {
      station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
      },
      time: {
        type: Number,
        required: true,
      },
      distance: {
        type: Number,
        required: true,
      },
    },
  ],
});

const TrainSettings = mongoose.model("TrainSettings", TrainSettingsSchema);
export default TrainSettings;
