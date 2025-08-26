import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now, expires: '7d' }, // auto delete after 7 days
});

export const BlacklistedToken = mongoose.model('BlacklistedToken', schema);
