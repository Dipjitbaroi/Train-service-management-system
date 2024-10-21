import Train from "../models/trainModel.js";
import TrainSettings from "../models/trainSettingsModel.js";
import Station from "../models/stationModel.js";

// Helper function to convert "HH:mm" to total minutes
export const convertTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to convert total minutes back to a Date object (assuming the same day)
export const convertMinutesToTime = (minutes, baseDate = new Date()) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const date = new Date(baseDate);
  date.setHours(hours);
  date.setMinutes(mins);
  return date;
};

// Function to create journeyDate (a Date object with departure time)
export const getJourneyDateWithTime = (timeString) => {
  const currentDate = new Date(); // Today's date
  const [hours, minutes] = timeString.split(":").map(Number);
  currentDate.setHours(hours, minutes, 0, 0); // Set the hours and minutes to match the departure time
  return currentDate; // This is the journeyDate with the departure time
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
    const departureTimeInMinutes = await convertTimeToMinutes(
      departureTimeFromOrigin
    );

    console.log(departureTimeInMinutes);

    // Calculate train stops arrival and departure times
    const trainStops = stops.map((stop) => {
      const arrivalTimeInMinutes = departureTimeInMinutes + stop.time; // arrivalTime = departureTime + stop.time
      const departureTimeInMinutesAtStop =
        arrivalTimeInMinutes + stop.standingTime; // departureTime = arrivalTime + standingTime
      return {
        station: stop.station,
        arrivalTime: convertMinutesToTime(arrivalTimeInMinutes),
        departureTime: convertMinutesToTime(departureTimeInMinutesAtStop),
      };
    });

    // Create journeyDate by combining today's date with the departureTimeFromOrigin
    const journeyDate = getJourneyDateWithTime(departureTimeFromOrigin);

    // Create a new Train document with the calculated stops
    const newTrain = new Train({
      name,
      trainSettings,
      journeyDate,
      stops: trainStops,
    });

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

export const getTrains = async (req, res) => {
  const { fromDate, toDate, search, fromDestination, toDestination } =
    req.query;

  try {
    // Build the filter object based on query parameters
    const filter = {};

    // Journey date filtering
    if (fromDate || toDate) {
      filter.journeyDate = {};
      if (fromDate) {
        filter.journeyDate.$gte = new Date(fromDate); // Greater than or equal to 'from' date
      }
      if (toDate) {
        filter.journeyDate.$lte = new Date(toDate); // Less than or equal to 'to' date
      }
    }

    // Search filtering by train name or station name
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } }, // Search by train name
        { "stops.station": { $regex: search, $options: "i" } }, // Optionally, search by station name
      ];
    }

    // Destination filtering by station names
    if (fromDestination || toDestination) {
      const stationFilter = {};

      if (fromDestination) {
        const fromStation = await Station.findOne({
          name: { $regex: fromDestination, $options: "i" },
        });
        if (fromStation) {
          stationFilter["stops.station"] = fromStation._id; // Filter by 'fromDestination' station ID
        }
      }

      if (toDestination) {
        const toStation = await Station.findOne({
          name: { $regex: toDestination, $options: "i" },
        });
        if (toStation) {
          // Ensure both fromDestination and toDestination are handled
          if (stationFilter["stops.station"]) {
            stationFilter["stops.station"] = {
              $all: [stationFilter["stops.station"], toStation._id],
            }; // Trains stopping at both 'from' and 'to' stations
          } else {
            stationFilter["stops.station"] = toStation._id; // Filter by 'toDestination' station ID if 'from' is not present
          }
        }
      }

      Object.assign(filter, stationFilter); // Add the station filters to the main filter object
    }

    // Find trains with optional filters and populate related trainSettings and station information
    const trains = await Train.find(filter)
      .populate("trainSettings") // Populate trainSettings information
      .populate("stops.station"); // Populate each station in stops

    res.status(200).json(trains);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
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
