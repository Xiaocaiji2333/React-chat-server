const md5 = require('blueimp-md5');
const router = require('express').Router();
const { UserModel, ChatModel } = require('./atguigu_db');
const filter = {password: 0};// 查询时过滤出指定的属性

router.post('/register', function(req, res){
  const {username, password, type} = req.body;
  // console.log(username, password, type);
  UserModel.findOne({username}, function(err, user){
    if(user){
      res.send({code: 1, msg: '此用户已存在！'});
      // console.log(user.password);
    }else{
      // console.log(username);
      new UserModel({username, password: md5(password), type}).save(function(err, user){
        // 生成一个 cookie(userid: user._id), 并交给浏览器保存
        // 持久化 cookie,浏览器会保存在本地文件
        res.cookie('userid', user._id, { maxAge: 1000*60*60*24*7 }); 
        res.send({ code: 0, data: { _id: user._id, username, type: user.type, header: user.header, 
          post: user.post, info: user.info, company: user.company, salary: user.salary } });
      })
    }
  })
})

router.post('/login', function(req, res){
  const {username, password} = req.body;
  UserModel.findOne({username, password: md5(password)}, filter, function(err, user){
    if(!user){
      res.send({code: 1, msg: '用户名或密码错误！'});
    }else{
      res.cookie('userid', user._id, { maxAge: 1000*60*60*24*7 });
      res.send({ code: 0, data: { _id: user._id, username, type: user.type, header: user.header, 
        post: user.post, info: user.info, company: user.company, salary: user.salary } });
    }
  })
})

router.post('/update', function(req, res){
  //从cookie中获取之前保存的userid
  const cookie = req.headers.cookie;
  const userid = cookie.split('%22')[1];
  // console.log(userid);
  if (!userid){
    return res.send({ code: 1, msg: '请先登录！' });
  }
  const user = req.body;
  UserModel.findByIdAndUpdate({ _id: userid }, user, function(error, oldUser){
    if (!oldUser){
      //通知浏览器删除错误的cookie userid
      res.clearCookie('userid');
      res.send({ code: 1, msg: '请先登录！'});
    }else {
      const { _id, username, type } = oldUser;
      //合并多个对象
      const data = Object.assign({ _id, username, type}, user);
      res.send({ code: 0, data });
    }
  })
})

router.get('/user', function(req, res){
  const cookie = req.headers.cookie;
  const userid = cookie.split('%22')[1];
  if (!userid){
    return res.send({ code: 1, msg: '请先登录！' });
  }
  UserModel.findOne({ _id: userid }, filter, function(error, user){
    res.send({ code: 0, data: user });
  })
})

router.get('/userlist', function(req, res){
  const { type } = req.query;
  UserModel.find({ type }, filter, function(error, users){
    res.send({ code: 0, data: users});
  })
})

router.get('/msglist', function (req, res) { 
  // 获取cookie中的userid 
  const cookie = req.headers.cookie;
  const userid = cookie.split('%22')[1];
   // 查询得到所有user文档数组 
    UserModel.find(function (err, userDocs) { 
    // 用对象存储所有user信息: key为user的_id,val为name和header组成的user对象 
    // const users = {};// 对象容器 
    // userDocs.forEach(doc => { 
    //   users[doc._id] = { username: doc.username, header: doc.header }; 
    // })

    const users = userDocs.reduce((users, user) => {
      users[user._id] = { username: user.username, header: user.header };
      return users;
    }, {});

    //查询userid相关的所有聊天信息 参数1: 查询条件 参数2: 过滤条件 参数3: 回调函数
    ChatModel.find({ '$or': [{ from: userid }, { to: userid }] }, filter, function (err, chatMsgs) { 
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据 
      res.send({ code: 0, data: { users, chatMsgs } }); 
    }) 
  }) 
})

router.post('/readmsg', function (req, res) { 
  // 得到请求中的from和to 
  const from = req.body.from;
  const cookie = req.headers.cookie;
  const to = cookie.split('%22')[1];
  //更新数据库中的chat数据 参数1: 查询条件 参数2: 更新为指定的数据对象 参数3: 是否1次更新多条, 默认只更新一条 参数 4: 更新完成的回调函数
  ChatModel.updateMany({ from, to, read: false }, { read: true }, { multi: true }, function (err, doc) { 
    console.log('/readmsg', doc); 
    res.send({ code: 0, data: doc.nModified }) //更新的数量 
  }) 
})

module.exports = router;