import WalletTransaction from "../models/walletTransactionModel.js";

// Get wallet transactions by user ID with optional date range
export const getWalletTransactionsByUserId = async (req, res) => {
  const { userId } = req.params; // Get the userId from the request parameters
  const { fromDate, toDate } = req.query; // Get fromDate and toDate from query parameters

  try {
    // Create filter object
    const filter = { user: userId };

    // If fromDate is provided, add to filter
    if (fromDate) {
      filter.date = { ...filter.date, $gte: new Date(fromDate) }; // Greater than or equal to fromDate
    }

    // If toDate is provided, add to filter
    if (toDate) {
      filter.date = { ...filter.date, $lte: new Date(toDate) }; // Less than or equal to toDate
    }

    // Fetch wallet transactions for the specified user and populate the user field
    const transactions = await WalletTransaction.find(filter).populate("user");

    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for this user." });
    }

    res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
