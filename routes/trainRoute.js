import express from "express";
import { addTrain } from "../controllers/trainController.js";

const router = express.Router();

router.post("/addTrain", addTrain);

// // Route to get all trains
// router.get("/", getAllTrains);

// // Route to get a train by ID
// router.get("/:id", getTrainById);

// // Route to update a train by ID
// router.put("/update:id", updateTrain);

// // Route to delete a train by ID
// router.delete("/:id", deleteTrain);

export default router;
