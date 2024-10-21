import Train from "../models/trainModel.js";
import TrainSettings from "../models/trainSettingsModel.js";
import Station from "../models/stationModel.js";

export const convertTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const convertMinutesToTime = (minutes, baseDate = new Date()) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const date = new Date(baseDate);
  date.setHours(hours);
  date.setMinutes(mins);
  return date;
};

export const getJourneyDateWithTime = (timeString) => {
  const currentDate = new Date();
  const [hours, minutes] = timeString.split(":").map(Number);
  currentDate.setHours(hours, minutes, 0, 0);
  return currentDate;
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

    const journeyDate = getJourneyDateWithTime(departureTimeFromOrigin);

    const trainStops = stops.map((stop) => {
      const arrivalTime = new Date(journeyDate);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + stop.time);

      const departureTime = new Date(arrivalTime);
      departureTime.setMinutes(departureTime.getMinutes() + stop.standingTime);

      return {
        station: stop.station,
        arrivalTime,
        departureTime,
      };
    });

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
    const filter = {};

    if (fromDate || toDate) {
      filter.journeyDate = {};
      if (fromDate) {
        filter.journeyDate.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.journeyDate.$lte = new Date(toDate);
      }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { "stops.station": { $regex: search, $options: "i" } },
      ];
    }

    if (fromDestination || toDestination) {
      const stationFilter = {};

      if (fromDestination) {
        const fromStation = await Station.findOne({
          name: { $regex: fromDestination, $options: "i" },
        });
        if (fromStation) {
          stationFilter["stops.station"] = fromStation._id;
        }
      }

      if (toDestination) {
        const toStation = await Station.findOne({
          name: { $regex: toDestination, $options: "i" },
        });
        if (toStation) {
          if (stationFilter["stops.station"]) {
            stationFilter["stops.station"] = {
              $all: [stationFilter["stops.station"], toStation._id],
            };
          } else {
            stationFilter["stops.station"] = toStation._id;
          }
        }
      }

      Object.assign(filter, stationFilter);
    }

    const trains = await Train.find(filter)
      .populate("trainSettings")
      .populate("stops.station");

    res.status(200).json(trains);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getTrainSettings = async (req, res) => {
  try {
    const trainSettingsList = await TrainSettings.find().populate(
      "origin destination stops.station"
    );
    res.status(200).json(trainSettingsList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getTrainSettingsById = async (req, res) => {
  const { id } = req.params;

  try {
    const trainSettings = await TrainSettings.findById(id).populate(
      "origin destination stops.station"
    );

    if (!trainSettings) {
      return res.status(404).json({ message: "Train settings not found" });
    }

    res.status(200).json(trainSettings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateTrainSettings = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    origin,
    destination,
    departureTimeFromOrigin,
    totalDistance,
    perKMTicketCost,
    stops,
  } = req.body;

  try {
    const updatedTrainSettings = await TrainSettings.findByIdAndUpdate(
      id,
      {
        name,
        origin,
        destination,
        departureTimeFromOrigin,
        totalDistance,
        perKMTicketCost,
        stops,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTrainSettings) {
      return res.status(404).json({ message: "Train settings not found" });
    }

    res.status(200).json({
      message: "Train settings updated successfully",
      trainSettings: updatedTrainSettings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteTrainSettings = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTrainSettings = await TrainSettings.findByIdAndDelete(id);

    if (!deletedTrainSettings) {
      return res.status(404).json({ message: "Train settings not found" });
    }

    res.status(200).json({ message: "Train settings deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
