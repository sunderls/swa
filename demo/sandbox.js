const log = message => {
  console.log("[sandbox]" + message);
};

const sendMessageToHost = message => {
  window.parent.postMessage(message, "*");
};

window.onmessage = ({ data }) => {
  console.log(data);
  switch (data) {
    default:
      sendMessageToHost(data);
  }
};

const init = () => {
  log("inited");
  sendMessageToHost("inited");
};

init();
