import mongoose from 'mongoose';

const WalletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const WalletTransaction = mongoose.model('WalletTransaction', WalletTransactionSchema);
export default WalletTransaction;
