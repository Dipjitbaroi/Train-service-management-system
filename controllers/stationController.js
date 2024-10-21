import Station from "../models/stationModel.js";

export const createStation = async (req, res) => {
  const { name, location, distance, center } = req.body;

  try {
    const newStation = new Station({ name, location, distance, center });
    await newStation.save();
    res.status(201).json(newStation);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json(stations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getStationById = async (req, res) => {
  const { id } = req.params;

  try {
    const station = await Station.findById(id);

    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    res.status(200).json(station);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateStation = async (req, res) => {
  const { id } = req.params;
  const { name, location, distance, center } = req.body;

  try {
    const updatedStation = await Station.findByIdAndUpdate(
      id,
      {
        name,
        location,
        distance,
        center,
      },
      { new: true, runValidators: true }
    );

    if (!updatedStation) {
      return res.status(404).json({ message: "Station not found" });
    }

    res.status(200).json({
      message: "Station updated successfully",
      station: updatedStation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deleteStation = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStation = await Station.findByIdAndDelete(id);

    if (!deletedStation) {
      return res.status(404).json({ message: "Station not found" });
    }

    res.status(200).json({ message: "Station deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
