const mongoose = require('mongoose');
const User = require('./models');

// MongoDB 连接 URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tengfei726:AxGmXE7vQQM41MMR@cluster0.06h3msu.mongodb.net/familygame?retryWrites=true&w=majority&appName=Cluster0';

module.exports = async (req, res) => {
  try {
    console.log('注册请求开始');
    console.log('环境变量 MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置');
    console.log('使用的连接字符串:', MONGODB_URI);

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

    console.log('开始连接数据库...');
    // 连接数据库
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
      console.log('数据库连接成功');
    }

    const { username, password } = req.body;
    console.log('接收到的数据:', { username, password: password ? '***' : 'undefined' });

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
    console.log('用户创建成功');

    res.json({ code: 0, msg: '注册成功' });
  } catch (error) {
    console.error('注册错误详情:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      code: 1, 
      msg: '服务器错误: ' + error.message,
      details: error.stack
    });
  }
}; 