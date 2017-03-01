var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);


var public = require('./common/public.js');
var index = require('./routes/index');
var login = require('./routes/login');
var reg = require('./routes/reg');
var admin = require('./routes/admin');
var logout = require('./routes/logout');


var app = express();
app.use(session({
    name: 'gakki_key',
    secret: 'Gakki_Smile',  // 用来对session id相关的cookie进行签名
    store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
    cookie: {
        maxAge: 3600 * 24 * 1000  // 有效期，单位是毫秒
    }
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html',require('ejs').__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//网页加载时 需要读取public/目录文件 调用public
app.use(public);
app.use('/', index);
app.use('/login', login);
app.use('/reg', reg);
app.use('/admin', admin);
app.use('/logout', logout);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
    let sess = req.session;
    let loginUser = sess.loginUser;
    let isLogined = !!loginUser;

  if(err.status == 404 || err.status == 500){
      res.render('error',{
      title: '出错啦！',
      isLogined: isLogined,
      name: loginUser || ''
     });
    }else{
      next();
    }
});

module.exports = app;
