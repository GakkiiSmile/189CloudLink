var express = require('express');
var fs = require('fs');
var superagent = require('superagent');
var router = express.Router();
var CryptoJS = require("crypto-js");
var moment = require('moment');
var parseString = require('xml2js').parseString;

var Cache = {};
setInterval(() => {
    Object.keys(Cache).forEach((key) => {
        var obj = Cache[key];
        obj.time--;
        if (obj.time <= 0) delete Cache[key];
    });
}, 1000);

router.use((req, res, next) => {
    req.config = require('../config.json');
    req.getApiData = (url, data, callback) => {
        var apiUrl = FindApiUrl(url);
        if(apiUrl != 'accessToken'){
            if (req.config.accessToken.trim() == '') return callback({noAccessToken: 'true'});
        }
        var now = moment();
        var timestamp = now.unix();
        var date = new Date(now).toUTCString();
        var Signature = CryptoJS.HmacSHA1(`AccessToken=${req.config.accessToken}&Operate=GET&RequestURI=/${apiUrl}.action&Date=${date}`, req.config.appSecret).toString();
        superagent.get(url).query(data).timeout(1000 * 10).set({
            'Date': date,
            'AccessToken': req.config.accessToken,
            'Signature': Signature
        }).buffer(true).end((err, res) => {
            if (err) return callback(err);
            if(IsJsonString(res.text)){ //天翼云又是返回json 又是返回xml 我真是日了狗
                return callback(null, JSON.parse(res.text));
            }
            parseString(res.text, function (error, result) {
                if(error) return callback(error);
                try {
                    callback(null, result);
                } catch (error) {
                    callback(error);
                }
            });
        });
    }
    req.postApiData = (url, data, callback) => {
        if (req.config.accessToken.trim() == '') return callback({noAccessToken: 'true'});

        var now = moment();
        var timestamp = now.unix();
        var date = new Date(now).toUTCString();
        var apiUrl = FindApiUrl(url);
        var Signature = CryptoJS.HmacSHA1(`AccessToken=${req.config.accessToken}&Operate=POST&RequestURI=/${apiUrl}.action&Date=${date}`, req.config.appSecret).toString();

        superagent.post(url).query(data).timeout(1000 * 10).set({
            'Date': date,
            'AccessToken': req.config.accessToken,
            'Signature': Signature
        }).buffer(true).end((err, res) => {
            if (err) return callback(err);
            parseString(res.text, function (error, result) {
                if(error) return callback(error);
                try {
                    callback(null, result);
                } catch (error) {
                    callback(error);
                }
            });
        });
    }

    req.setCache = (key, obj, time) => {
        Cache[key] = { time: time, data: obj };
        console.log(obj);
    }
    req.getCache = (key) => {
            return Cache[key] ? Cache[key] : null;
        }
    next();
});


router.get('/', function(req, res, next) {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    if(!isLogined){
        res.render('error', {
            title: '你好像没登录哎:-(',
            isLogined: isLogined,
            name: loginUser || ''
        });
    }else{
        res.render('admin', {
            title: 'admin',
            isLogined: isLogined,
            name: loginUser || '',
            authUrl: ''
        });
    }
});


// OAuth 重定向
router.get('/auth', (req, res, next) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    var timestamp = moment().unix();
    var appSignature = CryptoJS.HmacSHA1(`appKey=${req.config.appKey}&timestamp=${timestamp}`, req.config.appSecret);
    var args = `appKey=${req.config.appKey}&appSignature=${appSignature}&callbackUrl=${req.config.callbackUrl}&responseType=code&timestamp=${timestamp}`;
    var authUrl = `http://cloud.189.cn/open/oauth2/authorize.action?${args}`;

    if(!isLogined){
        res.render('error', {
            title: '你好像没登录哎:-(',
            isLogined: isLogined,
            name: loginUser || ''
        });
    }else{
        res.render('admin',{
            title: 'admin',
            isLogined: isLogined,
            name: loginUser || '',
            authUrl: authUrl
        });
    }
});

// OAuth 回调
router.get('/authCallback\&code\=:codeId', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    if(!isLogined){
        res.render('error', {
            title: '你好像没登录哎:-(',
            isLogined: isLogined,
            name: loginUser || ''
        });
        return;
    }
    // if(req.config.accessToken != '') return res.send('请先删除config.json accessToken值');
    var code = req.params.codeId;
    var timestamp = moment().unix();
    var appSignature = CryptoJS.HmacSHA1(`appKey=${req.config.appKey}&timestamp=${timestamp}`, req.config.appSecret).toString();
    req.getApiData('http://cloud.189.cn/open/oauth2/accessToken.action',{
        appKey: req.config.appKey,
        appSignature: appSignature,
        grantType : 'authorization_code',
        timestamp: timestamp,
        code: code
    },(err,result) => {
        if (err) return res.status(200).send({error: '获取Accesstoken失败！'});
        req.config.accessToken = result.accessToken;
        fs.writeFile('./config.json', JSON.stringify(req.config, null, 4), 'utf8', (err) => {
            var location = `window.location.protocol + '//' + document.domain + (location.port ? ':' + location.port : '') + '/admin'`;
            var script = `<script language='javascript' type='text/javascript'>setTimeout(function(){var toUrl = ${location};window.location.href=toUrl;}, 3000);</script>`;
            res.send(`Save Status: ${err || `保存配置成功！${script}`} <br>`);
            res.end();
        });
    });

});


router.get('/link/:fileId/*', (req, res) => {
    var fileId = req.params.fileId;
    var cache = req.getCache(fileId);
    if (cache) {
        res.set('Link-Cache', 'Hit ' + cache.time);
        return res.redirect(cache.data);
    }

    req.getApiData('http://api.cloud.189.cn/getFileDownloadUrl.action?', { fileId: fileId, short: 'true'}, (err, result) => {
        if(err != null){
            if (err.noAccessToken){
                return res.status(200).send(err);
            }else if(err) {
                return res.status(200).send({error:'好像出错了'});
            };
        }
        // if(err) return res.status(400).send(err);
        // 缓存直链
        if (req.config.linkCache) req.setCache(fileId, result.fileDownloadUrl, req.config.linkCacheTime);
        res.set('Link-Cache', 'Miss');
        res.redirect(result.fileDownloadUrl);
    });
});

// 危险操作，剔除此功能！
// router.get('/deletefile/:fileId', (req, res) => {
//     var fileId = req.params.fileId || '';
//     req.postApiData('http://api.cloud.189.cn/deleteFile.action', {
//         fileId: fileId,
//         forcedDelete : '0'
//     }, (err, result) => {
//         if (err) return res.status(200).send({error: '删除失败'});
//         res.json({result: 'success'});
//     });
// });

router.get('/folder/', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    if(!isLogined){
        res.render('error', {
            title: '你好像没登录哎:-(',
            isLogined: isLogined,
            name: loginUser || ''
        });
        return;
    }
    // 天翼云API出现问题，会暴露全部文件夹和文件 所以在此加入设置默认文件夹ID
    req.getApiData('http://api.cloud.189.cn/listFiles.action', req.config.defaultFolder == -1 ? {
        folderId : '',
        iconOption: '4'
    } : {
        folderId : '',
        iconOption: '4'
    }, (err, result) => {
        if(err != null){
            if (err.noAccessToken){
                return res.status(200).send(err);
            }else if(err) {
                return res.status(200).send({error:'好像出错了'});
            };
        }
        res.json(result);
    });
});

router.get('/folder/:folderId', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    if(!isLogined){
        res.render('error', {
            title: '你好像没登录哎:-(',
            isLogined: isLogined,
            name: loginUser || ''
        });
        return;
    }
    var folderId = req.params.folderId;
    req.getApiData('http://api.cloud.189.cn/listFiles.action', {
        folderId: folderId,
        iconOption: '4'
    }, (err, result) => {
        if(err != null){
            if (err.noAccessToken){
                return res.status(200).send(err);
            }else if(err) {
                return res.status(200).send({error:'好像出错了'});
            };
        }
        res.json(result);
    });
});

router.post('/search/', (req, res) => {
    var sess = req.session;
    var loginUser = sess.loginUser;
    var isLogined = !!loginUser;
    if(!isLogined){
        res.render('error', {
            title: '你好像没登录哎:-(',
            isLogined: isLogined,
            name: loginUser || ''
        });
        return;
    }
    var filename = req.body.filename || '';
    console.log(req.body.filename);
    req.postApiData('http://api.cloud.189.cn/searchFiles.action', {
        folderId: '',
        filename: filename,
        recursive : 1,
        iconOption: 2,
        fileType : 0
    }, (err, result) => {
        if(err != null){
            if (err.noAccessToken){
                return res.status(200).send(err);
            }else if(err) {
                return res.status(200).send({error:'好像出错了'});
            };
        }
        res.json(result);
    });
});


function FindApiUrl(url){
    var arr = ['getFileDownloadUrl','listFiles','searchFiles','deleteFile','accessToken'];
    for(i = 0; i < arr.length;i ++){
        if(url.includes(arr[i])){
            return arr[i];
        }
    }
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


module.exports = router;
