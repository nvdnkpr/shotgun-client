var io = require('socket.io'),
    fs = require('fs'),
    path = require('path');

exports.attach = function (server, shell) {
    var oldListeners = server.listeners('request');
    server.removeAllListeners('request');
    server.on('request', function (req, res) {
        if (req.url === '/shotgun/shotgun.client.js') {
            try {
                fs.readFile(path.join(__dirname, '/node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js'), function (err, socketIoClient) {
                    fs.readFile(path.join(__dirname, '/client/shotgun.client.js'), function (err, shotgunClient) {
                        res.writeHead(200, { 'Content-Type': 'application/javascript' });
                        res.end(socketIoClient + '\n\n' + shotgunClient);
                    });
                });
            } catch (e) {}
        }
        else {
            for (var i = 0, l = oldListeners.length; i < l; i++) {
                oldListeners[i].call(server, req, res);
            }
        }
    });
    io.listen(server)
        .of('/shotgun')
        .on('connection', function (socket) {
            socket.on('execute', function (cmdStr, context, options) {
                var result = shell.execute(cmdStr, context, options);
                socket.emit('result', result);
            });
        });
};