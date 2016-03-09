


var port = 8888;
var WebSocketServer = require('websocket').server;
var http = require('http');
var g_offers = {};

var server = http.createServer(function(request, response) {
});
server.listen(port, function() {
	console.log('Server running at http://localhost:' + port);
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept('peer-protocol', request.origin);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {


        if (message.type === 'utf8') {
            var data = JSON.parse(message.utf8Data);
						console.log('CALLING:', data.type);
						switch (data.type) {
							case 'set_offer':
								var offer = data.offer;
								//console.info('offer:', offer);
								g_offers[offer] = 1;
								break;
							case 'get_offers':
							  //console.info(JSON.stringify(g_offers));
								var msg = JSON.stringify({ type:'get_offers', offers: Object.keys(g_offers) });
								console.info(msg);
								connection.sendUTF(msg);
								break;
							case 'set_answer':
								var answer = data.answer;
								var offer = data.offer;
								//console.info(answer);
								g_offers[offer] = answer;
								break;
							case 'get_answer':
								var offer = data.offer;
								var answer = g_offers[offer];
								//console.info('offer:', offer);
								//console.info('answer:', answer);
								var msg = JSON.stringify({ type:'get_answer', answer: answer });
								connection.sendUTF(msg);
								break;
							default:
								console.error('Unknown message type.');
								console.error(data.type);
						}
        }
    });

    connection.on('close', function(connection) {
        // close user connection
    });
});
