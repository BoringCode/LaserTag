/*
 * Laser Tag Server
 * 2015 Bradley Rosenfeld, Micah Russell, Dustin Waldron
 *
 * Simple socket server for communicating with guns
 */

var net = require("net");
var prompt = require('prompt');
var colors = require('colors');
var ip = require("ip");
var moment = require('moment');

//Some setup
colors.setTheme({
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
});
prompt.message = "";
prompt.delimiter = "";
console.reset = function () {
  return process.stdout.write('\033c');
}


var Game = function(options) {
	this.settings = options;
	this.players = {};
}

Game.prototype.startServer = function() {
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

	}).listen(this.settings.port, this.settings.host);
	//Tell everyone where I'm running
	console.log(colors.info('Laser Tag server listening on ') + colors.debug(this.settings.host +':'+ this.settings.port).underline);
};

var Player = function(options) {
	this.settings = options;
}


var main = function() {
	console.log("Welcome to Laser Tag!\nPlease begin by creating a new game and specifying options.\n")
	var game;
	var schema = {
		properties: {
			name: {
				description: colors.prompt("Name:"),
				pattern: /^[a-zA-Z\s\-]+$/,
				message: colors.error('Name must be only letters, spaces, or dashes'),
				required: true
			},
			numTeams: {
				description: colors.prompt("Number of Teams:"),
				type: 'number',
				default: 2,
				required: true,
				message: colors.error("Must be a number")
			},
			maxShots: {
				description: colors.prompt("Max Shots:"),
				type: 'number',
				default: 3,
				required: true,
				message: colors.error("Must be a number")
			},
			shotFrequency: {
				description: colors.prompt("Shot Frequency (in seconds):"),
				type: 'number',
				default: 3,
				required: true,
				message: colors.error("Must be a number")
			},
			startTime: {
				description: colors.prompt("Game Start Time:"),
				required: true,
				default: moment().format("YYYY-MM-DD h:mm"),
				before: function(value) {
					return moment(value, "YYYY-MM-DD h:mm");
				}
			},
			endTime: {
				description: colors.prompt("Game End Time:"),
				required: true,
				default: moment().add(30, "m").format("YYYY-MM-DD h:mm"),
				before: function(value) {
					return moment(value, "YYYY-MM-DD h:mm");
				}
			},
			host: {
				description: colors.prompt("Host:"),
				required: true,
				default: ip.address(),
				format: "ip-address",
				message: colors.error("Must be an IP address")
			},
			port: {
				description: colors.prompt("Port:"),
				required: true,
				default: 8888,
				pattern: /^(\d{2,4})$/,
				message: colors.error("Must be 2-4 digits long")
			}
		}
	};
	prompt.start();
	prompt.get(schema, function (err, results) {
		if (!err) {
			console.reset();
			console.log(colors.info('Creating new game with these settings:'));
			for (var result in results) {
				console.log(colors.info("    " + result + ": ") + colors.data(results[result]));
			}
			game = new Game(results);
			game.startServer();
		}
	});
}

main();
