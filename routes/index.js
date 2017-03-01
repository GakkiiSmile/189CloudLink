var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
	let sess = req.session;
    let loginUser = sess.loginUser;
    let isLogined = !!loginUser;

  	res.render('index', {
  		title: '首页',
  		isLogined: isLogined,
  		name: loginUser || ''
  	});
});

module.exports = router;
