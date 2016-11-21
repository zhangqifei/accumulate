var http = require("http"),
    url = require("url"),
    fs = require("fs");

//->接收到客户端的请求一般分为两种:资源文件请求、数据接口的请求
var server1 = http.createServer(function (request, response) {
    var urlObj = url.parse(request.url, true),
        pathname = urlObj.pathname,
        query = urlObj.query;

    //->资源文件的请求处理:资源文件的请求都是客户端浏览器自己通过URL地址向服务器发送的,服务器返回的是对应文件中的源代码,客户端的浏览器接收到源代码后用自己的引擎渲染出对应的页面;真实项目中这部分的操作都是由工具(IIS、APACHE...)完成的
    var reg = /\.(HTML|CSS|JS|ICO)/i;
    if (reg.test(pathname)) {
        var suffix = reg.exec(pathname)[1].toUpperCase();
        var suffixMIME = suffix === 'HTML' ? 'text/html' : (suffix === 'CSS' ? 'text/css' : 'text/javascript');
        try {
            var conFile = fs.readFileSync('.' + pathname, 'utf-8');
            response.writeHead(200, {'content-type': suffixMIME + ';charset=utf-8;'});
            response.end(conFile);
        } catch (e) {
            response.writeHead(404, {'content-type': 'text/plain;charset=utf-8;'});
            response.end('request file is not found!');
        }
        return;
    }

    //->数据API请求处理:客户端的JS代码中我们通过AJAX向服务器发送的请求,服务器接收到请求并且获取客户端传递的数据,把需要的数据内容准备好,然后在返回给客户端,客户端在AJAX的READY STATE等于4的时候获取返回的内容(都是按照API的规范文档来处理)
    var customData = fs.readFileSync('./json/custom.json', 'utf-8');
    customData.length === 0 ? customData = '[]' : null;
    customData = JSON.parse(customData);

    var result = {
        code: 1,
        msg: '失败',
        data: null
    };

    var customId = null;

    //1)获取所有的客户信息
    if (pathname === '/getList') {
        if (customData.length > 0) {
            result = {
                code: 0,
                msg: '成功',
                data: customData
            };
        }
        response.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        response.end(JSON.stringify(result));
        return;
    }

    //2)获取指定的客户信息
    if (pathname === '/getInfo') {
        customId = query['customId'];
        customData.forEach(function (item, index) {
            if (item['id'] == customId) {
                result = {
                    code: 0,
                    msg: '成功',
                    data: item
                };
            }
        });
        response.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        response.end(JSON.stringify(result));
        return;
    }

    //3)增加客户信息
    if (pathname === '/addInfo') {
        var str = '';
        request.on('data', function (chunk) {
            str += chunk;
        });
        request.on('end', function () {
            //str->'{"name":"xxx","age":xxx,"phone":"","address":""}'
            var data = JSON.parse(str);
            data['id'] = customData.length === 0 ? 1 : parseFloat(customData[customData.length - 1]['id']) + 1;
            customData.push(data);
            fs.writeFileSync('./json/custom.json', JSON.stringify(customData), 'utf-8');
            result = {
                code: 0,
                msg: '成功'
            };
            response.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
            response.end(JSON.stringify(result));
        });
        return;
    }

    //4)修改客户信息
    if (pathname === '/updateInfo') {
        str = '';
        request.on('data', function (chunk) {
            str += chunk;
        });
        request.on('end', function () {
            var data = JSON.parse(str),
                flag = false;
            for (var i = 0; i < customData.length; i++) {
                if (data['id'] == customData[i]['id']) {
                    customData[i] = data;
                    flag = true;
                    break;
                }
            }
            if (flag) {
                fs.writeFileSync('./json/custom.json', JSON.stringify(customData), 'utf-8');
                result = {
                    code: 0,
                    msg: '成功'
                };
            }
            response.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
            response.end(JSON.stringify(result));
        });
        return;
    }

    //5)删除客户信息
    if (pathname === '/removeInfo') {
        customId = query['customId'];
        var flag = false;
        customData.forEach(function (item, index) {
            if (item['id'] == customId) {
                customData.splice(index, 1);
                flag = true;
            }
        });
        if (flag) {
            fs.writeFileSync('./json/custom.json', JSON.stringify(customData), 'utf-8');
            result = {
                code: 0,
                msg: '成功'
            };
        }
        response.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        response.end(JSON.stringify(result));
        return;
    }

    response.writeHead(404, {'content-type': 'text/plain;charset=utf-8;'});
    response.end('request url is not found!');
});
server1.listen(80, function () {
    console.log("server is success,listening on 80 port!");
});