import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { name, email, password, admin = false } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "This email already exists" });

    user = new User({ name, email, password, admin });
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, admin: user.admin },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await user.deleteOne();

    return res.json({ msg: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  const { name, email, password } = req.body; // New data from request
  const userId = req.user.id; // Get user ID from the request (must be authenticated)

  try {
    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;

    // If the password is provided, hash it before saving
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Save the updated user details
    await user.save();

    // Return the updated user information (excluding password)
    res.json({
      msg: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

export const addMoney = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    // Validate input
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update wallet balance
    user.walletBalance += amount;
    await user.save();

    // Create wallet transaction
    const transaction = new WalletTransaction({
      user: userId,
      amount,
      type: "credit",
      date: new Date(),
    });
    await transaction.save();

    // Respond with updated user info
    res.status(200).json({
      message: "Money added successfully",
      walletBalance: user.walletBalance,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
