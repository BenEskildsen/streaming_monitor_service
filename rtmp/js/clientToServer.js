
const axios = require('axios');

// HACK: we literally can't require this here because then primus tries
// to run on the clientside since it gets pulled in and it can't
// call a "require"
// INSTEAD: we add a <script src="/eureca.js"></script> to the <head> of index.html
// ... makes sense...
// const Eureca = require('eureca.io');

// const axiosInstance = axios.create({
//   baseURL: 'https://sidewalk-empire.herokuapp.com',
// });
// for localhost:
const axiosInstance = axios;

const sendDrawingData = (videoIndex, lines) => {
  axiosInstance.post('/drawings_' + videoIndex, {lines});
}

const getDrawingData = (store, videoIndex) => {
  axiosInstance.get('drawings_' + videoIndex)
    .then((res) => {
      store.dispatch({type: 'SET_LINES', videoIndex, lines: res.data});
    });
}


/**
 * Call these functions to send info to the server (Eureca)
 */

let server = null;
const setupClientToServer = (store) => {
  const client = new Eureca.Client({timeout: 1000, retry: 3});
  console.log("setting up eureca", client);
  // relay actions received from the server to this client's store
  client.exports.receiveAction = (action) => {
    store.dispatch(action);
  }
  client.ready(function (serverProxy) {
    console.log("server ready", server);
    server = serverProxy;
  });
  return client;
};

const dispatchToServer = (clientID, action) => {
  server.dispatch(clientID, action);
};

module.exports = {
  sendDrawingData,
  getDrawingData,
  setupClientToServer,
  dispatchToServer,
};
