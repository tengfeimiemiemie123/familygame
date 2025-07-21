import mongoose from 'mongoose';
import { Record } from './models.js';

export default async function handler(req, res) {
  await mongoose.connect(process.env.MONGODB_URI);
  if (req.method === 'POST') {
    const { username, time, difficulty } = req.body;
    await Record.create({ username, time, difficulty });
    res.json({ msg: '成绩已记录' });
  } else {
    res.status(405).end();
  }
} 