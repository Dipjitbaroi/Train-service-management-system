import express from "express";
import {
  getTicketsByUserId,
  purchaseTicket,
} from "../controllers/ticketController.js";
import { checkToken } from "../middleware/checkToken.js";

const router = express.Router();

router.post("/purchase-ticket", checkToken, purchaseTicket);
router.post("/get-ticket-by-user_id/:id", checkToken, getTicketsByUserId);

export default router;
