var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    let sess = req.session;
    let loginUser = sess.loginUser;
    let isLogined = !!loginUser;
    if(isLogined){
        res.render('error', {
            title: '登录就不要再注册了！',
            isLogined: isLogined,
            name: loginUser || ''
        });
    }else{
        res.render('reg', {
            title: '注册',
            isLogined: isLogined,
            name: loginUser || ''
        });
    }
});


module.exports = router;
