const mongoose = require('mongoose');

// 数据库连接配置
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log('已经连接到数据库');
      return;
    }

    // 使用环境变量或默认连接字符串
    const uri = process.env.MONGODB_URI || 'mongodb+srv://tengfei726:AxGmXE7vQQM41MMR@cluster0.06h3msu.mongodb.net/familygame?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('正在连接到数据库...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      autoIndex: true,
      autoCreate: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000
    });
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
};

// 确保连接关闭时重新连接
mongoose.connection.on('disconnected', () => {
  console.log('数据库连接断开，尝试重新连接...');
  connectDB();
});

// 用户模型
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 导出模型和连接函数
module.exports = {
  connectDB,
  User: mongoose.models.User || mongoose.model('User', UserSchema)
}; 