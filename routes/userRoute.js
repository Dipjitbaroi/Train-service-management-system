import express from "express";
import {
  register,
  login,
  deleteUser,
  updateUser,
  addMoney,
} from "../controllers/userController.js";
import { checkToken } from "../middleware/checkToken.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.put("/update", checkToken, updateUser);

router.delete("/delete/:id", checkToken, deleteUser);

router.post("/add-money", checkToken, addMoney);

export default router;
