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
Game.prototype.findPlayer = function(id, teamID, socket) {
	var self = this, player;
	//Check if teamID exists and that the player exists in the team
	if (!teamID || teamID < 0 || !(id in self.teams[teamID])) {
		console.log(colors.info("LASER TAG CLIENT: ") + colors.help("Creating new player..."));
		player = self.addPlayer(id);
		//New player, send initialization information
		//gameStart gameEnd teamID maxShots shotFrequency
		socket.write(moment(self.settings.gameStart).unix() + " " + moment(self.settings.gameEnd).unix() + " " + player.settings.teamID + " " + self.settings.maxShots + " " + self.settings.shotFrequency);
	} else {
		console.log(colors.info("LASER TAG CLIENT: ") + colors.help("Loading old player..."));
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
		console.log(colors.info('\nLASER TAG CLIENT CONNECTED: ') + colors.help(clientInfo));

		// Add a 'data' event handler to this instance of socket
		sock.on('data', function(data) {
			console.log(colors.info("LASER TAG CLIENT DATA: ") + data);

			var obj = JSON.parse(data);
			var player = self.findPlayer(obj.id, obj.teamID, sock);

			console.log(colors.info("LASER TAG CLIENT: ") + colors.help("Player loaded:") + " %j", player);
			
			//Record shots
			if (obj.shot) {
				if (player.recordShot(obj.time)) {
					console.log(colors.info("LASER TAG CLIENT: ") + colors.help("Shot recorded"));
					sock.write("1");
				} else {
					console.log(colors.info("LASER TAG CLIENT: ") + colors.warn("Invalid shot reported"));
					sock.write("-1");
				}
			}
			
			//record hit
			if (obj.hitBy) {
				if (obj.hitBy in self.teams[obj.opponentTeamID] && player.recordHit(obj.hitBy, obj.opponentTeamID, obj.time)) {
					//Update opponent with kill
					self.teams[obj.opponentTeamID][obj.hitBy].recordKill(obj.id, obj.teamID);
					console.log(colors.info("LASER TAG CLIENT: ") + colors.help("Hit recorded"));
					sock.write("1");
				} else {
					console.log(colors.info("LASER TAG CLIENT: ") + colors.warn("Invalid hit reported"));
					sock.write("-1");
				}
			}
	   });

		// Add a 'close' event handler to this instance of socket
		sock.on('close', function(data) {
			//Display a message on close
			console.log(colors.info('LASER TAG CLIENT CLOSED: ') + colors.help(clientInfo) + "\n");
			self.displayStats();
		});

		//Handle errors
		sock.on("error", function(e) {
			console.log(colors.error("LASER TAG CLIENT ERROR: ") + colors.data(e))
		});

	}).listen(self.settings.port, self.settings.host);

	//Tell everyone where I'm running
	console.log(colors.info('Laser Tag server listening on ') + colors.help(self.settings.host +':'+ self.settings.port));
}

//Display stats
Game.prototype.displayStats = function() {
	var self = this;
	console.log(colors.info("GAME STATS"));
	var winningTeam = -1, mostTeamKills = -1, mostKillsID = -1, mostKills = -1;
	for (var i = 0; i < self.teams.length; i++) {
		var team = self.teams[i];
		var numPlayers = Object.keys(team).length;
		var totalKills = 0, totalDeaths = 0, averageAccuracy = 0, totalKd = 0;
		console.log(colors.info("    Team: %s") + " (%d players)", i, numPlayers);
		//Loop through players
		for (var ID in team) {
			var player = team[ID];
			var kills = player.getNumKills(), shots = player.getNumShots(), deaths = player.getNumDeaths(), accuracy, kd;
			if (shots != 0) { accuracy = (kills / shots) * 100;	} else { accuracy = 0; } 
			if (deaths != 0) { kd = Math.floor(kills / deaths);	} else { kd = Math.floor(kills / 1); }
			totalKills += kills;
			totalDeaths += deaths;
			averageAccuracy += accuracy;
			//Cacluate if player has the most kills of any player
			if (kills > mostKills) {
				mostKillsID = ID;
				mostKills = kills;
			}
			console.log(colors.help("        Player: %s"), ID);
			console.log("            Kills: %d, Shots %d, Accuracy: %d\%, Deaths: %d, K/D: %d", kills, shots, accuracy, deaths, kd);
		}
		if (totalDeaths != 0) { totalKd = Math.floor(totalKills / totalDeaths); } else { totalKd = Math.floor(kills / 1); }
		averageAccuracy = (averageAccuracy / numPlayers) * 100;
		console.log(colors.help("\n        Team totals: ") + "Total Kills: %d, Total Deaths: %d, K/D: %d, Average Accuracy: %d\%\n", totalKills, totalDeaths, averageAccuracy, totalKd);
		if (totalKills > mostTeamKills) {
			winningTeam = i;
			mostTeamKills = totalKills;
		}
	}
	console.log(colors.info("Winners"));
	console.log("    Player '%s' had %d kills!", mostKillsID, mostKills);
	console.log("    Team '%d' had %d kills, congratulations!", winningTeam, mostTeamKills);
}

//Stop game and display stats
Game.prototype.stopGame = function() {
	var self = this;
	self.server.close(function() {
		console.log("Server shut down!");
	})
	self.displayStats();
}

/* 
 * Player constructor
 * Takes an object containing settings
 */
var Player = function(options) {
	this.settings = options;
	this.shots =[];
	this.hits = [];
	this.kills = [];
}

Player.prototype.getNumKills = function() {
	return this.kills.length;
}

Player.prototype.getNumShots = function() {
	return this.shots.length;
}

Player.prototype.getNumDeaths = function() {
	return this.hits.length;
}

//Record hits on the player
Player.prototype.recordHit = function(shooter, team, timestamp) {
	var self = this;
	var shot = {
		shooter: shooter,
		team: team,
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

//Record kills made by player
Player.prototype.recordKill = function(id, teamID) {
	var self = this;
	var kill = {
		opponent: id,
		teamID: teamID
	};
	self.kills.push(kill);
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
				default: 5,
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
				default: moment().add(10, "m").format("YYYY-MM-DD H:mm"),
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
