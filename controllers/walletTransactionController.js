import WalletTransaction from "../models/walletTransactionModel.js";

export const getWalletTransactionsByUserId = async (req, res) => {
  const { userId } = req.params;
  const { fromDate, toDate } = req.query;

  try {
    const filter = { user: userId };

    if (fromDate) {
      filter.date = { ...filter.date, $gte: new Date(fromDate) };
    }

    if (toDate) {
      filter.date = { ...filter.date, $lte: new Date(toDate) };
    }

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
