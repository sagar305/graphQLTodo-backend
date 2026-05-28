import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: [{ type: String, enum: ['admin', 'editor', 'user'], default: 'user' }],
  gender: { type: String, enum: ['female', 'male'] },
  dob: { type: Date },
  bio: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }, // auto delete after 7 days
});

export const Profile = mongoose.model('Profile', schema);
