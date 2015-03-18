/*
 * Laser Tag Server
 * 2015 Bradley Rosenfeld, Micah Russell, Dustin Waldron
 * 
 * Simple socket server for communicating with guns
 */

var ip = require("ip");
var net = require("net");

var HOST = ip.address();
var PORT = 6969;

// Create a server instance, and chain the listen function to it
net.createServer(function(sock) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

	sock.write("HEY THERE");
    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to the socket, the client will receive it as data from the server
        sock.write('You said "' + data + '"');
        
    });
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);
