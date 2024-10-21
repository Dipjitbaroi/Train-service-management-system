import User from "../models/userModel.js";
import Train from "../models/trainModel.js";
import Ticket from "../models/ticketModel.js";
import WalletTransaction from "../models/walletTransactionModel.js";

export const purchaseTicket = async (req, res) => {
  try {
    const { userId, trainId, from, to, totalSeats } = req.body;

    // Find the user and train
    const user = await User.findById(userId);
    const train = await Train.findById(trainId).populate("trainSettings");

    if (!user || !train) {
      return res.status(404).json({ msg: "User or Train not found" });
    }

    // Find the train settings
    const trainSettings = train.trainSettings;

    // Calculate the distance between "from" and "to" stations
    const fromStop = trainSettings.stops.find(
      (stop) => stop.station.toString() === from
    );
    const toStop = trainSettings.stops.find(
      (stop) => stop.station.toString() === to
    );

    if (!fromStop || !toStop) {
      return res.status(400).json({ msg: "Invalid from/to station" });
    }

    const distance = toStop.distance - fromStop.distance;
    if (distance <= 0) {
      return res.status(400).json({ msg: "Invalid station distance" });
    }

    // Calculate the total fare
    const perUnitFare = distance * trainSettings.perKMTicketCost;
    const totalFare = perUnitFare * totalSeats;

    // Check if the user has enough balance
    if (user.walletBalance < totalFare) {
      return res.status(400).json({ msg: "Insufficient wallet balance" });
    }

    // Deduct the fare from the user's wallet
    user.walletBalance -= totalFare;
    await user.save();

    // Create a wallet transaction (debit)
    const newTransaction = new WalletTransaction({
      user: userId,
      amount: totalFare,
      type: "debit",
    });
    await newTransaction.save();

    const journeyDate = new Date(train.journeyDate);
    journeyDate.setMinutes(journeyDate.getMinutes() + fromStop.time);

    // Create the ticket
    const newTicket = new Ticket({
      user: userId,
      from,
      to,
      train: train.name,
      totalSeats,
      perUnitFare,
      totalFare,
      distance,
      journeyDate,
    });

    const savedTicket = await newTicket.save();

    // Respond with the created ticket
    res.status(201).json({
      msg: "Ticket purchased successfully",
      ticket: savedTicket,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getTicketsByUserId = async (req, res) => {
  const { userId } = req.params; // Get userId from request parameters
  const { fromDate, toDate } = req.query; // Get optional date range from query parameters

  try {
    // Create filter object
    const filter = { user: userId };

    // If fromDate is provided, add to filter
    if (fromDate) {
      filter.journeyDate = { ...filter.journeyDate, $gte: new Date(fromDate) }; // Greater than or equal to fromDate
    }

    // If toDate is provided, add to filter
    if (toDate) {
      filter.journeyDate = { ...filter.journeyDate, $lte: new Date(toDate) }; // Less than or equal to toDate
    }

    // Fetch tickets for the specified user and populate relevant fields
    const tickets = await Ticket.find(filter)
      .populate("user") // Populate user information
      .populate("from") // Populate from station
      .populate("to"); // Populate to station

    if (!tickets || tickets.length === 0) {
      return res
        .status(404)
        .json({ message: "No tickets found for this user." });
    }

    res.status(200).json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
