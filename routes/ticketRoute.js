import express from "express";
import { purchaseTicket } from "../controllers/ticketController.js";

const router = express.Router();

router.post("/purchaseTicket", purchaseTicket);

export default router;
