import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['created', 'pending', 'progress', 'completed'],
    required: true,
    default: 'created',
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }, // auto delete after 7 days
});

export const ToDo = mongoose.model('Todo', schema);
