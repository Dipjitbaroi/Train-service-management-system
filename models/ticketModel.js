import mongoose from "mongoose";

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
