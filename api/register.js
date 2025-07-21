const mongoose = require('mongoose');
const User = require('./models');

// MongoDB 连接 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tengfei726:AxGmXE7vQQM41MMR@cluster0.06h3msu.mongodb.net/familygame?retryWrites=true&w=majority&appName=Cluster0';

module.exports = async (req, res) => {
  try {
    // 处理 CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // 只处理 POST 请求
    if (req.method !== 'POST') {
      return res.status(405).json({ code: 1, msg: '方法不允许' });
    }

    // 连接数据库
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { username, password } = req.body;

    // 验证参数
    if (!username || !password) {
      return res.json({ code: 1, msg: '用户名和密码不能为空' });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ code: 1, msg: '用户名已存在' });
    }

    // 创建新用户
    await User.create({ username, password });

    res.json({ code: 0, msg: '注册成功' });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ code: 1, msg: '服务器错误: ' + error.message });
  }
}; 