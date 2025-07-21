import mongoose from 'mongoose';
import { Record } from './models.js';

export default async function handler(req, res) {
  await mongoose.connect(process.env.MONGODB_URI);
  if (req.method === 'GET') {
    const rank = await Record.find().sort({ time: 1 }).limit(100);
    res.json(rank);
  } else {
    res.status(405).end();
  }
} 