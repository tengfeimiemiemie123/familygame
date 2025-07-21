import mongoose from 'mongoose';
import { User } from './models.js';

export default async function handler(req, res) {
  await mongoose.connect(process.env.MONGODB_URI);
  if (req.method === 'POST') {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(400).json({ msg: '用户名或密码错误' });
    res.json({ msg: '登录成功' });
  } else {
    res.status(405).end();
  }
} 