GTCourseWatch
=====
This is a registration assistance web application written in Node.js; access the site at [gtcoursewatch.us](gtcoursewatch.us)

UPDATE: This site is no longer hosted by me, I don't have the resouces to host it. It can still be run locally and used for personal purposes for the forseeable future. Here is how: 

Start a mongod instance then...

### Running Locally
```
node app.js
```

Then simply access localhost:8080 in your local browser to start using!

### Server Deployment
```
chmod +x start
./start
```
Designed to work on a CentOS RHEL server.
Note: mongod must be running in both cases.

## Features
### Course Watch
The core of the course watching system is a web scraping poller in Node.js that checks OSCAR for available seats every two minutes or so using setInterval. The system also automatically updates itself for new terms based on the date by using setInterval. Course watch requests are persisted using MongoDB.
### Automated Registration
This feature would not be possible without PhantomJS, which is a really cool and powerful tool. Basically, using the information a user provides, we can log in and register them for a course with Phantom running as a child process of Node.js on the server.
### Course Stats
A request to the server is made to scrape oscar for course information, which is then displayed in an animated pie chart made with Mike Bostock's fantastic d3.js data visualization library.
### Live Chat
Since I decided to experiment with WebSockets and socket.io when I started this project, adding live chat was quite simple. WebSockets are the supposed to be the future, and I can totally believe it.

## Tools Used
- Node.js
- MongoDB
- PhantomJS
- d3.js (Data Visualization Library)
- socket.io (WebSocket Library)
- Twitter Bootstrap
