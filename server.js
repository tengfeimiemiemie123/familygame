const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// 替换为你的Atlas连接字符串
mongoose.connect('mongodb+srv://tengfei726:AxGmXE7vQQM41MMR@cluster0.06h3msu.mongodb.net/sudoku?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
  registerTime: { type: Date, default: Date.now }
}));

const Record = mongoose.model('Record', new mongoose.Schema({
  username: String,
  time: Number,
  difficulty: String,
  finishTime: { type: Date, default: Date.now }
}));

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 注册
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (await User.findOne({ username })) return res.status(400).json({ msg: '用户名已存在' });
  await User.create({ username, password });
  res.json({ msg: '注册成功' });
});

// 登录
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(400).json({ msg: '用户名或密码错误' });
  res.json({ msg: '登录成功' });
});

// 上传成绩
app.post('/api/record', async (req, res) => {
  const { username, time, difficulty } = req.body;
  await Record.create({ username, time, difficulty });
  res.json({ msg: '成绩已记录' });
});

// 获取排行榜（全局最快100条）
app.get('/api/rank', async (req, res) => {
  const rank = await Record.find().sort({ time: 1 }).limit(100);
  res.json(rank);
});

// 适配Render云部署，监听0.0.0.0和process.env.PORT
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log('Server running on port', port)); 