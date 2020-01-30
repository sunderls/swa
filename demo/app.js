const log = message => {
  console.log("[sandbox]" + message)
}

const sendMessageToHost = (type, data = {}) => {
  window.parent.postMessage(JSON.stringify({ type, data }), "*")
}

window.onmessage = e => {
  const message = JSON.parse(e.data)
  switch (message.type) {
    case "render":
      sendMessageToHost("callback", {
        html: {
          tag: "div",
          children: [
            {
              tag: "p",
              children: [
                "I'm sandboxed script,  I can ask host to render what I want, like this built-in carousel"
              ]
            },
            {
              tag: "p",
              children: [
                "I cannot manipulate the DOM directly, so I couldn't make things too bad"
              ]
            },
            {
              tag: "carousel",
              props: {
                width: 400,
                height: 300,
                images: [
                  "https://unsplash.it/400/300?image=11",
                  "https://unsplash.it/400/300?image=10",
                  "https://unsplash.it/400/300?image=12"
                ]
              }
            }
          ]
        },
        uid: message.uid
      })
  }
}

const init = () => {
  log("inited")
  sendMessageToHost("inited")
}

init()
