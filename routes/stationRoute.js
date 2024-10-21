import express from "express";
import {
  createStation,
  getStations,
  updateStation,
  deleteStation,
} from "../controllers/stationController.js";
import { checkToken } from "../middleware/checkToken.js";

const router = express.Router();

router.post("/create", checkToken, createStation);

router.get("/", checkToken, getStations);

router.get("/get-station/:id", checkToken, updateStation);

router.put("/update/:id", checkToken, updateStation);

router.delete("/delete/:id", checkToken, deleteStation);

export default router;
