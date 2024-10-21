import User from "../models/userModel.js";
import Train from "../models/trainModel.js";
import Ticket from "../models/ticketModel.js";
import WalletTransaction from "../models/walletTransactionModel.js";
import dotenv from "dotenv";

dotenv.config();
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const purchaseTicket = async (req, res) => {
  try {
    const { userId, trainId, from, to, totalSeats } = req.body;

    const user = await User.findById(userId);
    const train = await Train.findById(trainId).populate("trainSettings");

    if (!user || !train) {
      return res.status(404).json({ msg: "User or Train not found" });
    }

    const trainSettings = train.trainSettings;
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

    const perUnitFare = distance * trainSettings.perKMTicketCost;
    const totalFare = perUnitFare * totalSeats;

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalFare * 100, // Amount in cents
      currency: "usd", // or your desired currency
      payment_method_types: ["card"], // You can customize this based on your requirements
    });

    // Send the client secret and the paymentIntent ID to the frontend
    res
      .status(200)
      .json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    return; // Ensure no further processing occurs after the initial response
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const confirmTicketPurchase = async (req, res) => {
  try {
    const { paymentIntentId, userId, trainId, from, to, totalSeats } = req.body;

    const user = await User.findById(userId);
    const train = await Train.findById(trainId).populate("trainSettings");

    if (!user || !train) {
      return res.status(404).json({ msg: "User or Train not found" });
    }

    const trainSettings = train.trainSettings;
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

    const perUnitFare = distance * trainSettings.perKMTicketCost;
    const totalFare = perUnitFare * totalSeats;

    // Verify the payment
    const confirmedPayment = await stripe.paymentIntents.confirm(
      paymentIntentId
    );

    if (confirmedPayment.status === "succeeded") {
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

      return res.status(201).json({
        msg: "Ticket purchased successfully",
        ticket: savedTicket,
      });
    } else {
      return res.status(400).json({ msg: "Payment failed" });
    }
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// export const purchaseTicket = async (req, res) => {
//   try {
//     const { userId, trainId, from, to, totalSeats } = req.body;

//     const user = await User.findById(userId);
//     const train = await Train.findById(trainId).populate("trainSettings");

//     if (!user || !train) {
//       return res.status(404).json({ msg: "User or Train not found" });
//     }

//     const trainSettings = train.trainSettings;

//     const fromStop = trainSettings.stops.find(
//       (stop) => stop.station.toString() === from
//     );
//     const toStop = trainSettings.stops.find(
//       (stop) => stop.station.toString() === to
//     );

//     if (!fromStop || !toStop) {
//       return res.status(400).json({ msg: "Invalid from/to station" });
//     }

//     const distance = toStop.distance - fromStop.distance;
//     if (distance <= 0) {
//       return res.status(400).json({ msg: "Invalid station distance" });
//     }

//     const perUnitFare = distance * trainSettings.perKMTicketCost;
//     const totalFare = perUnitFare * totalSeats;

//     if (user.walletBalance < totalFare) {
//       return res.status(400).json({ msg: "Insufficient wallet balance" });
//     }

//     user.walletBalance -= totalFare;
//     await user.save();

//     const newTransaction = new WalletTransaction({
//       user: userId,
//       amount: totalFare,
//       type: "debit",
//     });
//     await newTransaction.save();

//     const journeyDate = new Date(train.journeyDate);
//     journeyDate.setMinutes(journeyDate.getMinutes() + fromStop.time);

//     const newTicket = new Ticket({
//       user: userId,
//       from,
//       to,
//       train: train.name,
//       totalSeats,
//       perUnitFare,
//       totalFare,
//       distance,
//       journeyDate,
//     });

//     const savedTicket = await newTicket.save();

//     res.status(201).json({
//       msg: "Ticket purchased successfully",
//       ticket: savedTicket,
//     });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error", error: err.message });
//   }
// };

export const getTicketsByUserId = async (req, res) => {
  const { userId } = req.params;
  const { fromDate, toDate } = req.query;

  try {
    const filter = { user: userId };

    if (fromDate) {
      filter.journeyDate = { ...filter.journeyDate, $gte: new Date(fromDate) };
    }

    if (toDate) {
      filter.journeyDate = { ...filter.journeyDate, $lte: new Date(toDate) };
    }

    const tickets = await Ticket.find(filter)
      .populate("user")
      .populate("from")
      .populate("to");

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
