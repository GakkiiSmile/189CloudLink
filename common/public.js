var fs = require('fs');
var path = require('path');
var process = require('process');

module.exports = function(req,res,next){
	var paths = decodeURIComponent(req.url); //转码 识别中文文件
	if(paths.indexOf('public/') !== -1){//如果读取到./public/里面的文件 则返回正确的文件和文件类型
        var public_right = paths.split('public/')[1];
		var reqUrl = process.cwd() + '/public/' + public_right; //修正多级域名下的地址冲突问题 永远返回真实public路径
		var type = path.extname(reqUrl);
		fs.exists(reqUrl,function(exists){
			if(exists){
				fs.readFile(reqUrl,'base64',function(err,data){
					if(err) next();
					res.writeHead(200,{'Content-Type': types[type]});
					res.end(data,'base64');
				});
			}else{
				res.writeHead(404,{'Content-Type': 'text/plain'});
				res.end();
			}
		});
	}else{
		next();
	}
}

types = {
    ".css": "text/css",
    ".gif": "image/gif",
    ".html": "text/html",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".swf": "application/x-shockwave-flash",
    ".tiff": "image/tiff",
    ".txt": "text/plain",
    ".wav": "audio/x-wav",
    ".wma": "audio/x-ms-wma",
    ".wmv": "video/x-ms-wmv",
    ".xml": "text/xml",
    ".woff": "application/x-font-woff",
    ".woff2": "application/x-font-woff",
    ".ttf": "application/octet-stream"
};