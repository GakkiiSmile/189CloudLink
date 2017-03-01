var express = require('express');
var router = express.Router();
var users = require('../database/users').items;

router.get('/', function(req, res, next){
    let sess = req.session;
    let loginUser = sess.loginUser;
    let isLogined = !!loginUser;
    if(isLogined){
        res.render('error', {
            title: '你已经登录过啦！',
            isLogined: isLogined,
            name: loginUser || ''
        });
    }else{
        res.render('login', {
            title: '登录',
            isLogined: isLogined,
            name: loginUser || ''
        });
    }
});

var findUser = function(name, password){
    return users.find(function(item){
        return item.username === name && item.password === password;
    });
};

router.post('/', function(req, res, next) {
    let sess = req.session;
    let loginUser = sess.loginUser;
    let isLogined = !!loginUser;
    if(isLogined){
        res.render('error', {
            title: '你已经登录过啦！',
            isLogined: isLogined,
            name: loginUser || ''
        });
    }else{
        var user = findUser(req.body.username, req.body.password);
        if (user) {
            req.session.regenerate(function(err) {
                if (err) {
                    return res.json({ ret_code: 2, ret_msg: '登录失败' });
                }

                req.session.loginUser = user.username;
                res.json({ ret_code: 0, ret_msg: '登录成功' });
            });
        } else {
            res.json({ ret_code: 1, ret_msg: '账号或密码错误' });
        }
    }
});


module.exports = router;
