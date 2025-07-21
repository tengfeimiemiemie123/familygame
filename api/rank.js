const { connectDB } = require('./models');
const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  username: String,
  difficulty: String,
  time: Number,
  date: String
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
  if (req.method !== 'GET') {
    return res.status(405).json({ code: 1, msg: '方法不允许' });
  }
  try {
    await connectDB();
    const { difficulty } = req.query || {};
    if (!difficulty) {
      return res.status(400).json({ code: 1, msg: '缺少难度参数' });
    }
    const list = await Record.find({ difficulty }).sort({ time: 1 }).limit(20);
    res.json({ code: 0, list });
  } catch (e) {
    res.status(500).json({ code: 1, msg: '服务器错误', error: e.message });
  }
}; 