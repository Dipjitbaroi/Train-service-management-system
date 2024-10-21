import express from "express";
import {
  confirmTicketPurchase,
  getTicketsByUserId,
  purchaseTicket,
} from "../controllers/ticketController.js";
import { checkToken } from "../middleware/checkToken.js";

const router = express.Router();

router.post("/purchase-ticket", checkToken, purchaseTicket);
router.post("/confirm-purchase-ticket", checkToken, confirmTicketPurchase);
router.post("/get-ticket-by-user_id/:id", checkToken, getTicketsByUserId);

export default router;
