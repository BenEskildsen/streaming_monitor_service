const express = require("express");
const fs = require("fs");
const http = require('http');
const {Server} = require("socket.io");


// ------------------------------------------------------------------------------
// initialize server and listen to port
// ------------------------------------------------------------------------------
const app = express();
app.use(express.json());

// socket.io
const server = http.createServer(app);
const io = new Server(server);

const port = 8000;

// app.listen(port, function() {
//   console.log("server listening on port", port);
// });
app.use(express.static('./'));
server.listen(port, () => {
  console.log("server listening on port", port);
});




// ------------------------------------------------------------------------------
// Server state
// ------------------------------------------------------------------------------

const SESSION_ID = 0; // placeholder until we start handling multiple sessions
// SessionID -> {id: SessionID, clients: Array<ClientID>, }
const sessions = {};

let nextClientID = 1;
const socketClients = {};
const clientToSession = {};

sessions[SESSION_ID] = {
  id: SESSION_ID,
  clients: [],
  drawings: {}, // {[videoIndex]: Array<{start, end}>}
}


// ------------------------------------------------------------------------------
// Socket.io
// ------------------------------------------------------------------------------
io.on('connection', (socket) => {

  // on client connect
  socketClients[nextClientID] = socket;
  clientToSession[nextClientID] = SESSION_ID;
  // tell the client what its id is
  socket.emit('receiveAction', {
    type: 'SET',
    property: 'clientID',
    value: nextClientID,
  });
  // create the session if it doesn't exist
  if (!sessions[SESSION_ID]) {
    sessions[SESSION_ID] = {id: SESSION_ID, drawings: {}, clients: []};
  }
  const session = sessions[SESSION_ID];
  session.clients.push(nextClientID);
  // update the just-connected client with drawing data that may exist
  for (const videoIndex in session.drawings) {
    socket.emit('receiveAction', {
      type: 'ADD_LINES',
      lines: session.drawings[videoIndex],
      videoIndex,
    });
  }
  nextClientID++;

  socket.on('dispatch', (action) => {
    if (action == null) {
      return;
    }
    // console.log('client: ' + clientID + ' dispatches ' + action.type);
    switch (action.type) {
      case 'ADD_LINES':
        const {lines, videoIndex} = action;
        const session = sessions[SESSION_ID];
        if (!session.drawings[videoIndex]) {
          session.drawings[videoIndex] = [];
        }
        sessions[SESSION_ID].drawings[videoIndex].push(...lines);
        // TODO: need to emit to specific clients in this session
        socket.broadcast.emit('receiveAction', action);
        break;
      case 'SET_LINES': {
        const {videoIndex, lines} = action;
        const session = sessions[SESSION_ID];
        session.drawings[videoIndex] = lines;
        socket.broadcast.emit('receiveAction', action);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log("user disconnected");
  });
});


// ------------------------------------------------------------------------------
// Polling for drawing data (not using eureca or socket, just express)
// ------------------------------------------------------------------------------
app.get(/drawings_./, function(req, res) {
  console.log("get drawings", req.url);

  // const videos = config.videoFiles;
  const videoIndex = req.url.match(/\d/)[0];

  const session = sessions[SESSION_ID];
  if (!session.drawings[videoIndex]) {
    session.drawings[videoIndex] = [];
  }
  res.status(200).send(session.drawings[videoIndex]);

});

app.post(/clear_drawings_./, function(req, res) {
  console.log("post drawings", req.url);
  // const videos = config.videoFiles;
  const videoIndex = req.url.match(/\d/)[0];

  const session = sessions[SESSION_ID];
  session.drawings[videoIndex] = [];

  res.status(201).send({success: true});
});

app.post(/drawings_./, function(req, res) {
  console.log("post drawings", req.url);
  // const videos = config.videoFiles;
  const videoIndex = req.url.match(/\d/)[0];

  const {lines} = req.body;
  const session = sessions[SESSION_ID];
  if (!session.drawings[videoIndex]) {
    session.drawings[videoIndex] = [];
  }
  session.drawings[videoIndex].push(...lines);

  res.status(201).send({success: true});
});


