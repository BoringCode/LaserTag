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
var moment = require("moment");
var schedule = require("node-schedule");


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

/* 
 * Game constructor
 * Takes an object containing settings for the game
 */
var Game = function(options) {
	var self = this;
	self.settings = options;
	self.teams = [];
	self.server = null;	
	//Initialize teams
	var team;
	for (var i = 0; i < this.settings.numTeams; i++) {
		team = {};
		self.teams.push(team);
	}
	var start = moment(self.settings.startTime);
	var end = moment(self.settings.endTime);
	console.log("Waiting until " + start.format("YYYY-MM-DD h:m a") + " to start game.");
	//Schedule start game
	self.scheduledGame = schedule.scheduleJob(start.toDate(), function(self) {
		self.startGame();
		console.log("Game will end at " + end.format("YYYY-MM-DD h:m a"));
	}.bind(null, self));
	//Schedule end game
	schedule.scheduleJob(end.toDate(), function(self) {
		console.log("Ending game... Waiting for existing connections to close.");
		self.stopGame();
	}.bind(null, self));
}

//Assign to a team based upon the team with the least number of players
Game.prototype.assignTeam = function() {
	var self = this;
	//Default to team 0
	var teamID = 0, minPlayers = Object.keys(self.teams[0]).length;
	//Loop through the other teams to check if they have less players
	for (var i = 1; i < self.settings.numTeams; i++) {
		var team = self.teams[i];
		var length = Object.keys(team).length;
		//Check if this team has less players than the previous team
		if (length < minPlayers) {
			teamID = i;
			minPlayers = length;
		}
	}
	return teamID;
}

//Add new players to the game, requires a unique ID
Game.prototype.addPlayer = function(id) {
	var self = this;
	//Loop through teams and assign accordingly
	var team = self.assignTeam();
	//Add to team object
	this.teams[team][id] = new Player({teamID: team, playerID: id, maxShots: self.settings.maxShots, delay: self.settings.shotFrequency});
	return self.teams[team][id];
}

//Find player
Game.prototype.findPlayer = function(id, teamID) {
	var self = this, player;
	//Check if teamID exists and that the player exists in the team
	if (!teamID || teamID < 0 || !(id in self.teams[teamID])) {
		player = self.addPlayer(id);
	} else {
		player = self.teams[teamID][id];
	}
	return player;			
}

//Start the game server and process data from each player client
Game.prototype.startGame = function() {
	var self = this;
	// Create a server instance, and chain the listen function to it
	self.server = net.createServer(function(sock) {
		var clientInfo = sock.remoteAddress + ":" + sock.remotePort;
		// We have a connection - a socket object is assigned to the connection automatically
		console.log(colors.info('LASER TAG CLIENT CONNECTED: ') + colors.debug(clientInfo));

		// Add a 'data' event handler to this instance of socket
		sock.on('data', function(data) {
			console.log(colors.info("LASER TAG CLIENT DATA: ") + data);

			var obj = JSON.parse(data);
			var player = self.findPlayer(obj.id, obj.teamID);

			console.log(colors.info("LASER TAG CLIENT: ") + colors.data("Player loaded: "), player);
			
			//Record shots
			if (obj.shot) {
				if (player.recordShot(obj.time)) {
					console.log(colors.info("LASER TAG CLIENT: ") + colors.data("Shot recorded"));
					sock.write("shot recorded, thanks\n");
				} else {
					console.log(colors.info("LASER TAG CLIENT: ") + colors.warn("Invalid shot reported"));
					sock.write("Invalid shot\n");
				}
			}
			
			//record hit
			if (obj.hitBy) {
				if (player.recordHit(obj.hitBy, obj.time)) {
					console.log(colors.info("LASER TAG CLIENT: ") + colors.data("Hit recorded"));
					sock.write("hit record, thanks\n");
				} else {
					console.log(colors.info("LASER TAG CLIENT: ") + colors.warn("Invalid hit reported"));
					sock.write("Invalid hit\n");
				}
			}
			sock.write("thanks man");
			console.log("\n");
	   });

		// Add a 'close' event handler to this instance of socket
		sock.on('close', function(data) {
			//Display a message on close
			console.log(colors.info('LASER TAG CLIENT CLOSED: ') + colors.debug(clientInfo) + "\n");
		});

		//Handle errors
		sock.on("error", function(e) {
			console.log(colors.error("LASER TAG CLIENT ERROR: ") + colors.data(e))
		});

	}).listen(self.settings.port, self.settings.host);

	//Tell everyone where I'm running
	console.log(colors.info('Laser Tag server listening on ') + colors.debug(self.settings.host +':'+ self.settings.port));
}

//Stop game and display stats
Game.prototype.stopGame = function() {
	var self = this;
	self.server.close(function() {
		console.log("Server shut down!");
	})
}

/* 
 * Player constructor
 * Takes an object containing settings
 */
var Player = function(options) {
	this.settings = options;
	this.shots =[];
	this.hits = [];
}
//Record hits on the player
Player.prototype.recordHit = function(shooter, timestamp) {
	var self = this;
	var shot = {
		shooter: shooter,
		time: moment(timestamp, "YYYY-MM-DD H:m:s"),
	}
	self.hits.push(shot);
	return true;
}
//Record shots made by the player, rate limited according to the game settings that the player is apart of
Player.prototype.recordShot = function(timestamp) {
	var self = this;
	//Make sure player hasn't exceeded number of shots
	if (self.shots.length >= self.settings.maxShots) return false;
	//Validate shot frequency
	var time = moment(timestamp, "YYYY-MM-DD H:m:s");
	var previousShot = self.shots[self.shots.length-1];
	if (self.shots.length === 0 || (moment.isMoment(previousShot) && previousShot.add(self.settings.delay, "s").isBefore(time))) {
		self.shots.push(time);
		console.log(self);
		return true;
	} else {
		return false;
	}
}

//Gets settings from the user and starts a new game instance
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
				default: moment().format("YYYY-MM-DD H:mm"),
				before: function(value) {
					return moment(value, "YYYY-MM-DD H:mm").toArray();
				}
			},
			endTime: {
				description: colors.prompt("Game End Time:"),
				required: true,
				default: moment().add(30, "m").format("YYYY-MM-DD H:mm"),
				before: function(value) {
					return moment(value, "YYYY-MM-DD H:mm").toArray();
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
		}
	});
}
main();
