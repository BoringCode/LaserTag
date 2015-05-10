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

Game.prototype.addPlayer = function(id) {
	this.players.id = new Player();
}

Game.prototype.startServer = function() {
	var self = this;
	// Create a server instance, and chain the listen function to it
	net.createServer(function(sock) {
		// We have a connection - a socket object is assigned to the connection automatically
		console.log(colors.info('LASER TAG CLIENT CONNECTED: ') + colors.debug(sock.remoteAddress +':'+ sock.remotePort));

		// Add a 'data' event handler to this instance of socket
		sock.on('data', function(data) {
			console.log(colors.info("LASER TAG CLIENT DATA: ") + data);
			var obj = JSON.parse(data);
			console.log(obj);
			if (!obj.id in self.players) {
				self.addPlayer(obj.id);
			} else {
				var player = self.players.id;
			}
	   });

		// Add a 'close' event handler to this instance of socket
		sock.on('close', function(data) {
			console.log(data);
			//Display a message on close
			console.log('LASER TAG CLIENT CLOSED: ');
		});

		//Handle errors
		sock.on("error", function(e) {
			console.log(colors.error("LASER TAG CLIENT ERROR: ") + colors.debug(e))
		});

	}).listen(self.settings.port, self.settings.host);
	//Tell everyone where I'm running
	console.log(colors.info('Laser Tag server listening on ') + colors.debug(self.settings.host +':'+ self.settings.port));
};

var Player = function(options) {
	this.settings = options;
}


var main = function() {
	console.reset();
	console.log("Welcome to Laser Tag!\nPlease begin by creating a new game and specifying options.\n")
	var game;
	var schema = {
		properties: {
			name: {
				description: colors.prompt("Name:"),
				pattern: /^[a-zA-Z\s\-]+$/,
				message: colors.error('Name must be only letters, spaces, or dashes'),
				default: "Some new game",
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
