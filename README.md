#LaserTag
A laser tag server written in Node.js and a laser tag client written in C

This branch is a stripped down version of the main branch, specifically built for our Data Communications class.

##Server
Install dependencies: `npm install`


###Running


```
$ cd ./server
$ node server.js
```


###Development

The socket server for communication with guns is located in `./server/`


###Production

In production, `pm2` should be used to handle node processes.

Run
```
$ cd ./server
$ NODE_ENV=prod pm2 start server.js
```

##Client

Compile `gcc -Wall -o simpleClient.o simpleClient.c`

or use the Makefile provided for simpleClient2.c program

Run `./simpleClient.o 45.55.149.40 8888`
