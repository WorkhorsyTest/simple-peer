


var port = 8888;
var WebSocketServer = require('websocket').server;
var http = require('http');
var g_offers = {};

var server = http.createServer(function(request, response) {
	response.end('This is a WebSocket server.');
});
server.listen(port, function() {
	console.log('Server running at http://localhost:' + port);
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

var g_offer_connections = {};
var g_next_id = 1;

wsServer.on('request', function(request) {
    var connection = request.accept('peer-protocol', request.origin);
		connection.id = g_next_id++;
		console.log(connection.id);

		connection.on('error', function (error) {
        console.error('error: ', connection.id, error);
    });

		connection.on('open', function () {
        console.error('open: ', connection.id);
    });

		connection.on('close', function(connection) {
        console.log('closed: ', connection.id);
    });

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var data = JSON.parse(message.utf8Data);
						console.log('CALLING:', data.type);
						switch (data.type) {
							case 'set_offer':
								var offer = data.offer;
								//console.info('offer:', offer);
								g_offers[offer] = 1;
								g_offer_connections[offer] = connection;
								break;
							case 'get_offers':
							  //console.info(JSON.stringify(g_offers));
								var msg = JSON.stringify({ type:'get_offers', offers: Object.keys(g_offers) });
								console.info(msg);
								connection.sendUTF(msg);
								break;
							case 'set_answer':
								// Save the answer for this offer
								var answer = data.answer;
								var offer = data.offer;
								//console.info(answer);
								g_offers[offer] = answer;

								// Send the offers' connection the answer
								var offer_con = g_offer_connections[offer];
								var msg = JSON.stringify({ type:'get_answer', answer: answer });
								offer_con.sendUTF(msg);
								break;
/*
							case 'get_answer':
								var offer = data.offer;
								var answer = g_offers[offer];
								//console.info('offer:', offer);
								//console.info('answer:', answer);
								var msg = JSON.stringify({ type:'get_answer', answer: answer });
								connection.sendUTF(msg);
								break;
*/
							default:
								console.error('Unknown message type.');
								console.error(data.type);
						}
        }
    });
});
