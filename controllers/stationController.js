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

export const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
