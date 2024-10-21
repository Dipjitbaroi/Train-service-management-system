import mongoose from "mongoose";
import Station from "./stationModel.js";

const TicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
  },
  train: {
    type: String,
    required: true,
  },
  totalSeats: {
    type: Number,
    required: true,
  },
  perUnitFare: {
    type: Number,
    required: true,
  },
  totalFare: {
    type: Number,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  journeyDate: {
    type: Date,
    default: Date.now,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

const Ticket = mongoose.model("Ticket", TicketSchema);
export default Ticket;
