import mongoose from 'mongoose';
import { User } from './models.js';

export default async function handler(req, res) {
  await mongoose.connect(process.env.MONGODB_URI);
  if (req.method === 'POST') {
    const { username, password } = req.body;
    if (await User.findOne({ username })) return res.status(400).json({ msg: '用户名已存在' });
    await User.create({ username, password });
    res.json({ msg: '注册成功' });
  } else {
    res.status(405).end();
  }
} 