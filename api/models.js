import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  registerTime: { type: Date, default: Date.now }
});

const RecordSchema = new mongoose.Schema({
  username: String,
  time: Number,
  difficulty: String,
  finishTime: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Record = mongoose.models.Record || mongoose.model('Record', RecordSchema); 