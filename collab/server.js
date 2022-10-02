const express = require("express");
const fs = require("fs");
// const http = require('http');
// const {config} = require("./js/config");
// const Eureca = require('eureca.io');


const config = {
  videoFiles: [
    {path: "videos/antocracy_trailer_1.mp4", type: "video/mp4"},
    {path: "videos/zoomed_out_ants.mov", type: "video/mp4"},
  ],
};

const app = express();
// eureca initializations
// const server = http.createServer(app);
// const eurecaServer = new Eureca.Server({allow: ['receiveAction']});
// eurecaServer.attach(server);

const port = process.env.PORT || 8000;
console.log('server running in ', __dirname);

// app.get("/", function(req, res) {
//   res.sendFile(__dirname + "/index.html");
// });
//
// app.get("/css/styles.css", function(req, res) {
//   res.sendFile(__dirname + "/css/styles.css");
// });
// app.get("/bundle.js", function(req, res) {
//   res.sendFile(__dirname + "/bundle.js");
// });
app.use(express.json());


// ------------------------------------------------------------------------------
// Server state
// ------------------------------------------------------------------------------

const SESSION_ID = 0; // placeholder until we start handling multiple sessions
// SessionID -> {id: SessionID, clients: Array<ClientID>, }
const sessions = {};
sessions[SESSION_ID] = {
  id: SESSION_ID,
  drawings: {}, // {[videoIndex]: Array<{start, end}>}
}



// ------------------------------------------------------------------------------
// Polling for drawing data (not using eureca, just express)
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

// ------------------------------------------------------------------------------
// Sending video (not using eureca, just express)
// ------------------------------------------------------------------------------
app.get(/video_./, function(req, res) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires range header");
  }

  const videos = config.videoFiles;
  const vidIndex = req.url.match(/\d/)[0];

  if (!videos[vidIndex]) {
    res.status(404).send("No video with index " + vidIndex);
    return;
  }

  const videoSize = fs.statSync(videos[vidIndex].path).size;

  // parse range
  // Example "bytes="32324-" just give me the
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": videos[vidIndex]
  };


  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videos[vidIndex].path, {start, end});
  videoStream.pipe(res);
});


// ------------------------------------------------------------------------------
// listen to port
// ------------------------------------------------------------------------------
// console.log("server listening on port", port);
app.listen(port, function() {
  console.log("server listening on port", port);
});
// app.use(express.static('./'));
// server.listen(port)


// ------------------------------------------------------------------------------
// functions under exports namespace become callable from client side
// ------------------------------------------------------------------------------
// eurecaServer.exports.dispatch = function (clientID, action) {
//   if (action == null) {
//     return;
//   }
//   console.log('client: ' + clientID + ' dispatches ' + action.type);
//   switch (action.type) {
//     case 'ADD_LINES':
//       const {lines, videoIndex} = action;
//       const session = sessions[SESSION_ID];
//       if (!session.drawings[videoIndex]) {
//         session.drawings[videoIndex] = [];
//       }
//       sessions[SESSION_ID].drawings[videoIndex].push(...lines);
//       dispatchToOtherClients(clientID, action);
//       break;
//   }
// }
//
//
// // ------------------------------------------------------------------------------
// // each time a client is connected we call
// // ------------------------------------------------------------------------------
// eurecaServer.onConnect(function (socket) {
//   const client = socket.clientProxy; // get remote client ref
//   console.log("client connecting", nextClientID);
//
//   eurecaClients[nextClientID] = client;
//   clientToSession[nextClientID] = SESSION_ID;
//
//   // tell the client what its id is
//   client.receiveAction({
//     type: 'SET',
//     property: 'clientID',
//     value: nextClientID,
//   });
//
//   // create the session if it doesn't exist
//   if (!sessions[SESSION_ID]) {
//   }
//   sessions[SESSION_ID].clients.push(nextClientID);
//
//   // update the just-connected client with drawing data that may exist
//   for (const videoIndex in session.drawings) {
//     client.receiveAction({
//       type: 'ADD_LINES',
//       lines: session.drawing[videoIndex],
//       videoIndex,
//     });
//   }
//
//   nextClientID++;
// });
// ------------------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------------------
// function dispatchToOtherClients(initialClientID, action, allClients, alsoSelf) {
//   const clientsToSendTo = allClients
//     ? eurecaClients
//     : clientsInSession(clientToSession[playerID]);
//   for (const clientID in clientsToSendTo) {
//     if (clientID != initialClientID || alsoSelf) {
//       eurecaClients[clientID].receiveAction(action);
//     }
//   }
// }
