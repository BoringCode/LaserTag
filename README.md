#LaserTag
A laser tag server written in Node.js and a laser tag client written in C


##Server
Install dependencies: `npm install`

If this is your first time, install Grunt: `npm install -g grunt-cli`

###Running

On Windows:

```
$ cd ./server
$ set NODE_ENV=dev & node main
```

On Unix systems:
```
$ cd ./server
$ NODE_ENV=dev node main
```

###Development

The front end web server is located in `./server/web/`. Built using Express for routing.

The socket server for communication with guns is located in `./server/socket/`

Configuration can be found in `./server/config.json`. This is done on an environment basis (for example `dev`).

####Directory Structure

```
LaserTag/server/
..../socket
..../lasertag-db
..../web
......../public
............/fonts
............/js
............/css
......../routes
......../views
......../src
............/js
................/dependencies
................/controllers
................/directives
................/factories
................/filters
```

All Javascript development should be done inside the source folder. Split your Angular.js files into the correct folders.

####Grunt

Grunt is a task runner that we are using for compiling our Javascript for production. The default task will output unminified JS files and will watch the src folder for changes.

Running grunt is dead simple.

```
$ cd ./server
$ grunt
```

This will launch the dev task (which outputs unminfied JS files to the public JS folder) and launches a watch task to allow for quick updating while in development.

####Using Watch

In development it can be helpful to automatically reload the app. Using PM2, you can watch the server directory for changes.

```
$ cd ./server
$ pm2 start main.js --watch
$ grunt
```

###Production

A production server is running on `http://dev.bradleyrosenfeld.com` or `45.55.149.40`

In production, `pm2` should be used to handle node processes.

Run
```
$ cd ./server
$ grunt build
$ NODE_ENV=prod pm2 start main.js
```

##Client

Compile `gcc -Wall -o simpleClient.o simpleClient.c`

or use the Makefile provided for simpleClient2.c program

Run `./simpleClient.o 45.55.149.40 8888`

##Todo

- Implement lasertag-db
- Create API (and document) for socket server and web app to communicate with the database
- Define and implement socket communication spec
- Implement and complete web app for game management
