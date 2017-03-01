var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
	let sess = req.session;
    let loginUser = sess.loginUser;
    let isLogined = !!loginUser;
    if(!isLogined){
    	res.render('error', {
	  		title: '你已经退出了！',
	  		isLogined: isLogined,
	  		name: loginUser || ''
	  	});
    }else{
    	req.session.destroy(function(err) {
	        if(err){
	            res.json({ret_code: 2, ret_msg: '退出登录失败'});
	            return;
	        }
	        // req.session.loginUser = null;
	        res.clearCookie('gakki_key');
	        res.redirect('/');
	    });
    }
});

module.exports = router;
