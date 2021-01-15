const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./atguigu_router');

const server = require('http').createServer(app);
require('./socketIO_server')(server);
const post = 9001;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((request, response, next) => {
  console.log("请求了硅谷服务器");
  console.log("请求来自于：" + request.get('Host'));
  console.log("请求的地址：" + request.url);
  // console.log(request.body.username);
  next();
});

app.use(router);

server.listen(post);

console.log("http://localhost:" + post);