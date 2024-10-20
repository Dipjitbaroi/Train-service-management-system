import mongoose from "mongoose";

const StationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  center: {
    type: Boolean,
    default: false,
  },
});

const Station = mongoose.model("Station", StationSchema);
export default Station;
