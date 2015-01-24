$(function(){

	$('.overlay').hide();
	$('.frame').hide();

	var room = $('#room').html();
	var user = $('#username').html();

	var messageHeight = $('#message').height();

	var messageId = 'message';
	var conversationId = 'messages';

	//var socket = io('/'+room);
	var socket = io();

	socket.emit('subscribe', room, user);

	$('#send').submit(function(){
		var message = $('#'+messageId).val().trim();
		if(message !== ''){
			var packet = {
				'username': user,
				'message': message.replace(/\n|\r|\r\n/g, '<br />')
			};
			socket.emit('message', packet);
		}
		$('#'+messageId).val('');
		$('#'+messageId).height(messageHeight);
		return false;
	});

	$('#sendPrivate').submit(function(){
		$('#send').submit();
		return false;
	});
	
	socket.on('join', function(username){
		var addedClient = '<p>'+username+' has entered the room'+'</p>';
		$('#'+conversationId).append(addedClient);
	});

	socket.on('leave', function(username){
		var removedClient = '<p>'+username+' has exited the room'+'</p>';
		$('#'+conversationId).append(removedClient);
	});
	
	socket.on('message', function(context){
		var userWidth = 2;
		var messageWidth = 10;
		if(conversationId === 'messagesPrivate'){
			userWidth = 3;
			messageWidth = 9;
		}
		with(context){
			var messageElement = 
			'<p class="row">'+
				'<span class="col-xs-'+userWidth+'">'+
				username+
				': '+
				'</span>'+
				'<span class="col-xs-'+messageWidth+'">'+
				message+
				'</span>'+
			'</p>';
			
		}

		var conversationElement = $('#'+conversationId);

		if((conversationElement.prop('scrollHeight') - conversationElement.height() < conversationElement.scrollTop() + 5) || user === context.username){
			conversationElement.append(messageElement);
			conversationElement.scrollTop(conversationElement.prop('scrollHeight'));
		}else{
			conversationElement.append(messageElement);
		}

	});
	
	socket.on('update-client-list', function(clients){
		var list = '';
		for(client in clients){
			list += '<li><span class="client pointer">'+clients[client]+'</span></li>';
		}
		$('#client-list').html(list);
	});
	
	socket.on('request', function(request){
		if(confirm('???please though')){
			socket.emit('confirm', request);
		}else{
			socket.emit('deny', request);
		}
	});

	socket.on('confirm', function(request){
		messageId = 'messagePrivate';
		conversationId = 'messagesPrivate';
		$('.overlay').show();
		$('.frame').show();
	});

	socket.on('deny', function(request){
		alert('no one likes you');
	});
	
	$('#message').keypress(function(e){
		if(e.which === 13 && !e.shiftKey){
			$('#send').submit();
		}
		
	}).scroll(function(){
		$(this).height($(this).prop('scrollHeight'));
	});

	$('#messagePrivate').keypress(function(e){
		if(e.which === 13 && !e.shiftKey){
			$('#send').submit();
		}
		
	}).scroll(function(){
		$(this).height($(this).prop('scrollHeight'));
	});
	
	$('#client-list').on('click', 'li .client', function(event){
		if($(this).html() !== user){
			var request = {
				from: user,
				to: $(this).html()
			};
			socket.emit('request', request);
		}
	});

	$('#exit').click(function(){
		$('.overlay').hide();
		$('.frame').hide();
		socket.emit('unsubscribe', user);
		socket.emit('subscribe', room, user);
		messageId = 'message';
		conversationId = 'messages';
	});

});