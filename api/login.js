const mongoose = require('mongoose');
const User = require('./models');

// MongoDB 连接 URI
const MONGODB_URI = process.env.MONGODB_URI;

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

    // 查找用户
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.json({ code: 1, msg: '用户名或密码错误' });
    }

    res.json({ 
      code: 0, 
      msg: '登录成功',
      username: user.username
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ code: 1, msg: '服务器错误: ' + error.message });
  }
}; 