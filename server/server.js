/*
 * Laser Tag Server
 * 2015 Bradley Rosenfeld, Micah Russell, Dustin Waldron
 *
 * Simple socket server for communicating with guns
 */

 var ip = require("ip");
 var net = require("net");


 var HOST = config.server.host || ip.address();
 var PORT = config.server.socketPort || 8888;

// Create a server instance, and chain the listen function to it
net.createServer(function(sock) {

	// We have a connection - a socket object is assigned to the connection automatically
	console.log('LASER TAG CLIENT CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

	//Send stuff to the client
	sock.write("HEY THERE");

	// Add a 'data' event handler to this instance of socket
	sock.on('data', function(data) {
        	//Print what was sent by the client
        	console.log('DATA ' + sock.remoteAddress + ': ' + data);
		sock.write("You sent some data: " + data);
        });

	// Add a 'close' event handler to this instance of socket
	sock.on('close', function(data) {
		//Display a message on close
		console.log('LASER TAG CLIENT CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
	});

	//Handle errors
	sock.on("error", function(e) {
		console.log("Caught an error");
		console.log(e);
	});

}).listen(PORT, HOST);

//Tell everyone where I'm running
console.log('Laser Tag server listening on ' + HOST +':'+ PORT);

module.exports = net;
