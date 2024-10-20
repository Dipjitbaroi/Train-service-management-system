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
  departureTimeFromOrigin: {
    type: String, // Storing time as a string in "HH:mm" format
    required: true,
    validate: {
      validator: function (v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v); // Validates "HH:mm" format
      },
      message: (props) =>
        `${props.value} is not a valid time! Format should be HH:mm`,
    },
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
      standingTime: {
        type: Number,
        required: true,
      },
    },
  ],
});

const TrainSettings = mongoose.model("TrainSettings", TrainSettingsSchema);
export default TrainSettings;
