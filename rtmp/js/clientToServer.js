
const axios = require('axios');

// HACK: we literally can't require this here because then primus tries
// to run on the clientside since it gets pulled in and it can't
// call a "require"
// INSTEAD: we add a <script src="/eureca.js"></script> to the <head> of index.html
// ... makes sense...
// const Eureca = require('eureca.io');

const axiosInstance = axios.create({
  baseURL: 'http://206.189.227.139',
});
// for localhost:
// const axiosInstance = axios;

const sendDrawingData = (videoIndex, lines) => {
  axiosInstance.post('/drawings_' + videoIndex, {lines})
    .then(() => {
      console.log("post succeeded");
    })
    .catch(e => {
      console.log("post failed", e);
    });
}

const getDrawingData = (store, videoIndex) => {
  axiosInstance.get('/drawings_' + videoIndex)
    .then((res) => {
      console.log("get succeeded");
      store.dispatch({type: 'SET_LINES', videoIndex, lines: res.data});
    })
    .catch(e => {
      console.log('get failed', e);
    });
}

const clearDrawingData = (store, videoIndex) => {
  axiosInstance.post('/clear_drawings_' + videoIndex)
    .then(() => {
      console.log("clear post succeeded");
    })
    .catch(e => {
      console.log("clear post failed", e);
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
  clearDrawingData,
  setupClientToServer,
  dispatchToServer,
};
