
/**
 * Socket.io functions
 */
let socket = null;
const setupSocket = (store) => {
  socket = io();
  socket.on('receiveAction', (action) => {
    console.log("received", action);
    store.dispatch(action);
  });
  return socket;
}

const dispatchToServer = (action) => {
  socket.emit('dispatch', action);
};


module.exports = {
  dispatchToServer,
  setupSocket,
};
