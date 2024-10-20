import mongoose from "mongoose";

const TrainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
