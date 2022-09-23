const {getDrawingData} = require('../clientToServer');

const initDrawingPollingSystem = (store) => {
  const interval = setInterval(() => {
    const state = store.getState();
    getDrawingData(store, state.videoIndex);
  }, 1000);
  return interval;
}

module.exports = {initDrawingPollingSystem};
