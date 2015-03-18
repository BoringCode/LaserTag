#LaserTag
A laser tag server written in Node.js and a laser tag client written in C

##Production Server

A production server is running on `http://dev.bradleyrosenfeld.com` or `45.55.149.40`

##Server
Install dependencies: `npm install`

Run `node index.js`

By default, the server will attempt to run on the external IP address of the current system. This can be changed by editing the HOST variable in index.js. Runs on port `8888`

##Client

Compile `gcc -Wall -o simpleClient.o simpleClient.c`

Run `./simpleClient.o 45.55.149.40 8888`

##Todo

- All the things
