const { connectDB, User } = require('./models');
const mongoose = require('mongoose');

// 定义成绩模型
const RecordSchema = new mongoose.Schema({
  username: { type: String, required: true },
  difficulty: { type: String, required: true },
  time: { type: Number, required: true },
  date: { type: String, required: true, default: () => new Date().toISOString().slice(0, 10) }
});
const Record = mongoose.models.Record || mongoose.model('Record', RecordSchema);

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 1, msg: '方法不允许' });
  }
  try {
    await connectDB();
    const { username, difficulty, time } = req.body || {};
    if (!username || !difficulty || typeof time !== 'number') {
      return res.status(400).json({ code: 1, msg: '参数不完整' });
    }
    const date = new Date().toISOString().slice(0, 10);
    await Record.create({ username, difficulty, time, date });
    res.json({ code: 0, msg: '记录成功' });
  } catch (e) {
    res.status(500).json({ code: 1, msg: '服务器错误', error: e.message });
  }
}; 