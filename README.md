#LaserTag
A laser tag server written in Node.js and a laser tag client written in C


##Server
Install dependencies: `npm install`

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

###Production

A production server is running on `http://dev.bradleyrosenfeld.com` or `45.55.149.40`

In production, `pm2` should be used to handle node processes.

Run
```
$ cd ./server
$ NODE_ENV=prod pm2 start main.js
```

##Client

Compile `gcc -Wall -o simpleClient.o simpleClient.c`

Run `./simpleClient.o 45.55.149.40 8888`

##Todo

- Implement lasertag-db
- Create API (and document) for socket server and web app to communicate with the database
- Define and implement socket communication spec
- Implement and complete web app for game management
