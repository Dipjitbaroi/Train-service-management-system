import Train from "../models/trainModel.js";
import Station from "../models/stationModel.js";

// Create a new train
export const createTrain = async (req, res) => {
  const { name, per_km_ticket_cost, stops } = req.body;

  try {
    const newTrain = new Train({ name, per_km_ticket_cost, stops });
    await newTrain.save();
    res.status(201).json(newTrain);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all trains
export const getAllTrains = async (req, res) => {
  try {
    const trains = await Train.find().populate("stops.station"); // Populate station data
    res.json(trains);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get a train by ID
export const getTrainById = async (req, res) => {
  const { id } = req.params;

  try {
    const train = await Train.findById(id).populate("stops.station");

    if (!train) {
      return res.status(404).json({ msg: "Train not found" });
    }

    res.json(train);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update a train by ID
export const updateTrain = async (req, res) => {
  const { id } = req.params;
  const { name, per_km_ticket_cost, stops } = req.body;

  try {
    const train = await Train.findById(id);

    if (!train) {
      return res.status(404).json({ msg: "Train not found" });
    }

    train.name = name || train.name; // Update name if provided
    train.per_km_ticket_cost = per_km_ticket_cost || train.per_km_ticket_cost; // Update ticket cost if provided
    train.stops = stops || train.stops; // Update stops if provided

    await train.save();
    res.json({ msg: "Train updated successfully", train });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete a train by ID
export const deleteTrain = async (req, res) => {
  const { id } = req.params;

  try {
    const train = await Train.findByIdAndDelete(id);

    if (!train) {
      return res.status(404).json({ msg: "Train not found" });
    }

    res.json({ msg: "Train deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
