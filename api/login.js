const mongoose = require('mongoose');
const User = require('./models');

// MongoDB 连接 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tengfei726:AxGmXE7vQQM41MMR@cluster0.06h3msu.mongodb.net/familygame?retryWrites=true&w=majority&appName=Cluster0';

module.exports = async (req, res) => {
  console.log('收到请求，方法:', req.method);
  console.log('请求头:', req.headers);
  
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.status(200).end();
    return;
  }

  // 只处理 POST 请求
  if (req.method !== 'POST') {
    console.log('非 POST 请求被拒绝');
    return res.status(405).json({ 
      code: 1, 
      msg: '方法不允许，请使用 POST 请求',
      method: req.method 
    });
  }

  try {
    console.log('开始处理登录请求...');
    console.log('环境变量 MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置');

    // 连接数据库
    if (!mongoose.connections[0].readyState) {
      console.log('正在连接数据库...');
      await mongoose.connect(MONGODB_URI);
      console.log('数据库连接成功');
    }

    // 解析请求体
    const { username, password } = req.body || {};
    console.log('请求体:', { username, password: password ? '***' : 'undefined' });

    // 验证参数
    if (!username || !password) {
      return res.status(400).json({ code: 1, msg: '用户名和密码不能为空' });
    }

    // 查找用户
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ code: 1, msg: '用户名或密码错误' });
    }

    console.log('用户登录成功:', username);
    res.json({ 
      code: 0, 
      msg: '登录成功',
      username: user.username
    });
  } catch (error) {
    console.error('登录错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      code: 1, 
      msg: '服务器错误: ' + error.message,
      details: error.stack
    });
  }
}; 