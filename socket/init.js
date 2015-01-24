module.exports = function(server){

	var io = require('socket.io').listen(server);

	var current = 0;

	var colors = ['red', 'green', 'blue', 'purple'];

	var rooms = {
		'21 club': new Array(),
		'cotton club': new Array(),
		'angels share': new Array(),
		'back room': new Array(),
		'b flat': new Array()
	};

	var clients = new Object();
	var connected = new Object();

	function unsubscribe(username, socket){
		var room = clients[username].room;
		socket.leave(room);
		io.to(room).emit('leave', username);
		if(rooms[room]){
			var index = rooms[room].indexOf(username);
			rooms[room].splice(index, 1);
			io.to(room).emit('update-client-list', rooms[room]);
		}
	}

	io.on('connection', function(socket){

		socket.on('subscribe', function(room, username){
			if(!clients[username]){
				clients[username] = {
				'room': room,
				'id': socket.id,
				'color': colors[current++]
				};
				connected[socket.id] = {
					'username': username,
					'socket': socket
				};
			}else{
				clients[username].room = room;
			}
			
			rooms[room].push(username);
			socket.join(room);
			io.to(room).emit('update-client-list', rooms[room]);
			io.to(room).emit('join', username);
			socket.emit('update-client-list', rooms[room]);
		});

		socket.on('unsubscribe', function(username){
			unsubscribe(username, socket);
		});

		socket.on('disconnect', function(){
			var username = connected[socket.id].username;
			unsubscribe(username, socket);
			delete clients[username];
		});

		socket.on('message', function(data){
			var color = clients[data.username].color;
			var room = clients[data.username].room;
			
			io.to(room).emit('message', 
				{
					'username': data.username, 
					'message': data.message, 
					'color': color
				});
		});

		socket.on('request', function(request){
			console.log(request);
			var id = clients[request.to].id;
			connected[id].socket.emit('request', request);
		});

		socket.on('confirm', function(request){
			var fromClient = clients[request.from];
			var toClient = clients[request.to];

			var fromId = fromClient.id;
			var toId = toClient.id;

			var fromSocket = connected[fromId].socket;
			var toSocket = connected[toId].socket;

			unsubscribe(request.from, fromSocket);
			unsubscribe(request.to, toSocket);

			var newRoom = request.from+request.to;

			fromSocket.join(newRoom);
			toSocket.join(newRoom);
			fromClient.room = newRoom;
			toClient.room = newRoom;

			fromSocket.emit('confirm', request);
			toSocket.emit('confirm', request);
		});

		socket.on('deny', function(request){
			console.log('deny');
			var id = clients[request.from].id;
			connected[id].socket.emit('deny', request);
		});

	});

}