const md5 = require('blueimp-md5');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/MongoDB_LJQ');
const conn = mongoose.connection;
conn.on('connected', function(){
  console.log('数据库连接成功！');
});

const userSchema = mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  type: {type: String, required: true},
  header: {type: String},
  post: {type: String},
  info: {type: String},
  company: {type: String},
  salary: {type: String}
});

const UserModel = mongoose.model('user', userSchema);

exports.UserModel = UserModel;

// 定义chats集合的文档结构 
const chatSchema = mongoose.Schema({ 
  from: { type: String, required: true },// 发送用户的id 
  to: { type: String, required: true },// 接收用户的id 
  chat_id: { type: String, required: true },// from和to组成的字符串 
  content: { type: String, required: true },// 内容 
  read: { type:Boolean, default: false },// 标识是否已读 
  create_time: { type: Number } // 创建时间 
});
// 定义能操作chats集合数据的Model 
const ChatModel = mongoose.model('chat', chatSchema); 
// 向外暴露Model 
exports.ChatModel = ChatModel;