const log = message => {
  console.log("[swa]" + message);
};

const initSandbox = () => {
  return new Promise(resolve => {
    const handlers = [];
    window.onmessage = e => {
      for (const handler of handlers) {
        if (handler[0] === e.data) {
          handler[1](e.data);
        }
      }
    };

    const onMessage = (message, handler) => {
      handlers.push([message, handler]);
    };

    onMessage("inited", () => {
      log("ok, sandbox is inited");
      resolve([sendMessageToSandbox, onMessage]);
    });

    const elSandbox = document.createElement("iframe");
    elSandbox.sandbox = "allow-scripts allow-same-origin";
    elSandbox.id = "sandbox";
    document.body.appendChild(elSandbox);
    elSandbox.src = "./sandbox.html";
    const sendMessageToSandbox = message => {
      log("message to sandbox", message);
      elSandbox.contentWindow.postMessage(message, "*");
    };
  });
};

const init = async () => {
  log("inited");
  const [sendMessageToSandbox, onMessage] = await initSandbox();
};

init();
