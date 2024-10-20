import Train from "../models/trainModel.js";
import TrainSettings from "../models/trainSettingsModel.js";
import Station from "../models/stationModel.js";

// Helper function to convert "HH:mm" to total minutes
const convertTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert total minutes back to a Date object (assuming the same day)
const convertMinutesToTime = (minutes, baseDate = new Date()) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const date = new Date(baseDate);
  date.setHours(hours);
  date.setMinutes(mins);
  return date;
};

export const addTrain = async (req, res) => {
  try {
    const {
      name,
      origin,
      destination,
      totalDistance,
      departureTimeFromOrigin,
      perKMTicketCost,
      stops,
    } = req.body;

    // Create a new TrainSettings document
    const newTrainSettings = new TrainSettings({
      name,
      origin,
      destination,
      totalDistance,
      departureTimeFromOrigin,
      perKMTicketCost,
      stops,
    });

    const savedTrainSettings = await newTrainSettings.save();
    const trainSettings = savedTrainSettings._id;

    // Convert departureTimeFromOrigin to minutes for calculation
    const departureTimeInMinutes = convertTimeToMinutes(
      departureTimeFromOrigin
    );

    // Calculate train stops arrival and departure times
    const trainStops = stops.map((stop) => {
      const arrivalTimeInMinutes = departureTimeInMinutes + stop.time; // arrivalTime = departureTime + stop.time
      const departureTimeInMinutes = arrivalTimeInMinutes + stop.standingTime; // departureTime = arrivalTime + standingTime

      return {
        station: stop.station,
        arrivalTime: convertMinutesToTime(arrivalTimeInMinutes),
        departureTime: convertMinutesToTime(departureTimeInMinutes),
      };
    });

    // Create a new Train document with the calculated stops
    const newTrain = new Train({ name, trainSettings, stops: trainStops });
    await newTrain.save();

    res.status(201).json({
      msg: "Train added successfully",
      trainSettings: savedTrainSettings,
      train: newTrain,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// CREATE - Add new TrainSettings
export const createTrainSettings = async (req, res) => {
  try {
    const { name, origin, destination, totalDistance, departureTimeFromOrigin, perKMTicketCost, stops } =
      req.body;

    const newTrainSettings = new TrainSettings({
      name,
      origin,
      destination,
      totalDistance,
      departureTimeFromOrigin,
      perKMTicketCost,
      stops,
    });

    const savedTrainSettings = await newTrainSettings.save();
    const trainSettings = savedTrainSettings._id;
    const newTrain = new Train({ name, trainSettings, stops });
    await newTrain.save();

    res.status(201).json({
      msg: "Train added successfully",
      trainSettings: savedTrainSettings,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// READ - Get all TrainSettings
export const getTrainSettings = async (req, res) => {
  try {
    const trainSettings = await TrainSettings.find().populate(
      "origin destination stops.station"
    );

    res.status(200).json(trainSettings);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// READ - Get TrainSettings by ID
export const getTrainSettingsById = async (req, res) => {
  const { id } = req.params;

  try {
    const trainSettings = await TrainSettings.findById(id).populate(
      "origin destination stops.station"
    );

    if (!trainSettings) {
      return res.status(404).json({ msg: "Train settings not found" });
    }

    res.status(200).json(trainSettings);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// UPDATE - Update TrainSettings by ID
export const updateTrainSettings = async (req, res) => {
  const { id } = req.params;
  const { name, origin, destination, totalDistance, perKMTicketCost, stops } =
    req.body;

  try {
    const updatedTrainSettings = await TrainSettings.findByIdAndUpdate(
      id,
      {
        name,
        origin,
        destination,
        totalDistance,
        perKMTicketCost,
        stops,
      },
      { new: true, runValidators: true }
    ).populate("origin destination stops.station");

    if (!updatedTrainSettings) {
      return res.status(404).json({ msg: "Train settings not found" });
    }

    res.status(200).json({
      msg: "Train settings updated successfully",
      trainSettings: updatedTrainSettings,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// DELETE - Delete TrainSettings by ID
export const deleteTrainSettings = async (req, res) => {
  const { id } = req.params;

  try {
    const trainSettings = await TrainSettings.findById(id);

    if (!trainSettings) {
      return res.status(404).json({ msg: "Train settings not found" });
    }

    await trainSettings.deleteOne();

    res.status(200).json({ msg: "Train settings deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const createTrain = async (req, res) => {
  const { name, trainSettings, stops } = req.body;

  try {
    const newTrain = new Train({ name, trainSettings, stops });
    await newTrain.save();
    res.status(201).json({
      msg: "Train created successfully",
      train: newTrain,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
