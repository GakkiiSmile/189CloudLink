## 189CloudLink

[![made](https://img.shields.io/badge/made%20by-%E2%9D%A4-ff69b4.svg?style=flat-square)](http://blog.pjunjie.cc/)

> 一个基于node的189个人云解析平台

## 介绍
你可以用189的直链来节省你服务器的带宽。
你甚至可以用她来做视频的直链。
当然图片音乐什么的更是不在话下。
![image](https://github.com/GakkiiSmile/189CloudLink/blob/master/gif/ezgif-3-ff3e680243.gif)
![image](https://github.com/GakkiiSmile/189CloudLink/blob/master/gif/ezgif-3-0527f033dd.gif)
## 安装
### 1.依赖
在根目录下执行,安装依赖包
`
   $ npm install
`

### 2.配置
在根目录下的config.json

``` json
{
    "appKey": "这里写Key",
    "appSecret": "这里写Secret",
    "callbackUrl": "这里写回调的页面", // eg: http://localhost:3000/admin/authCallback
    "accessToken": "",
    "linkCache": true, //这个是直链缓存开关
    "linkCacheTime": 3600,//这个是缓存时间
    "defaultFolder": -1
}
```
***
登录账户在database目录下的users.js里面可以自行更改

``` js
module.exports = {
    items: [
        {username: 'username', password: 'password'}
    ]
};
```

## 相关项目

感谢以下Projects

- [189CloudLinkTools by Srar](https://github.com/Srar/189CloudLinkTools)

- [reactPagination by Silence11](https://github.com/Silence11/reactPagination)

## 结语
初次写项目，有很多东西都是借鉴他人的。代码也不是很规范，重复代码也有很多。
如有改进的地方，可以给我反馈。
最后感谢大家！

## LICENSE
[The Star And Thank Author License](https://github.com/GakkiiSmile/189CloudLink/blob/master/LICENSE)
