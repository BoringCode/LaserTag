/*
 * Laser Tag Server
 * 2015 Bradley Rosenfeld and team
 *
 * Loads the config and runs the web and socket servers
 */

var config = require('./config.json')[process.env.NODE_ENV || 'dev'];
var webServer = require('./web/server.js');
var socketServer = require('./socket/server.js');
