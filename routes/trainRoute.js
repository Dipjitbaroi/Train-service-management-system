import express from "express";
import {
  addTrain,
  getTrains,
  getTrainSettings,
  getTrainSettingsById,
  updateTrainSettings,
  deleteTrainSettings,
} from "../controllers/trainController.js";
import { checkToken } from "../middleware/checkToken.js";

const router = express.Router();

router.post("/add-train", checkToken, addTrain);

router.get("/", checkToken, getTrains);

router.get("/train-settings", checkToken, getTrainSettings);

router.get("/train-settings/:id", checkToken, getTrainSettingsById);

router.put("/update-train-settings/:id", checkToken, updateTrainSettings);

router.delete("/delete-train-settings/:id", checkToken, deleteTrainSettings);

export default router;
