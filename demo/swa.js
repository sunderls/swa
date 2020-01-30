const log = (...args) => {
  console.log(...["[swa]", ...args])
}

const getUid = (() => {
  let id = 1
  return () => id++
})()

const initSandbox = () => {
  return new Promise(resolve => {
    let handlers = []

    window.onmessage = e => {
      const message = JSON.parse(e.data)
      log("onmessage", message)
      for (const [type, handler] of handlers) {
        if (type === message.type) {
          handler(message.data)
        }
      }
    }

    const onMessage = (message, handler, uid) => {
      handlers.push([message, handler, uid])
    }

    onMessage("inited", () => {
      log("ok, sandbox is inited")
      resolve([sendMessageToSandbox, onMessage])
      handlers = handlers.filter(([message]) => message !== "inited")
    })

    const elSandbox = document.createElement("iframe")
    elSandbox.sandbox = "allow-scripts allow-same-origin"
    elSandbox.id = "sandbox"
    document.body.appendChild(elSandbox)
    elSandbox.src = "./app.html"
    const sendMessageToSandbox = (type, data, callback) => {
      log("message to sandbox", type, data)
      const uid = getUid()
      elSandbox.contentWindow.postMessage(
        JSON.stringify({
          type,
          data,
          uid
        }),
        "*"
      )

      if (callback) {
        onMessage(
          "callback",
          data => {
            if (data.uid === uid) {
              callback(data)
              handlers = handlers.filter(([, , _uid]) => _uid !== uid)
            }
          },
          uid
        )
      }
    }
  })
}

const render = ({ tag, children = [], props = {} }) => {
  switch (tag) {
    case "carousel":
      const $div = document.createElement("div")
      const $inner = document.createElement("div")

      $div.style.width = props.width + "px"
      $div.style.height = props.height + "px"
      $div.style.overflow = "hidden"
      $div.style.position = "relative"
      $div.style.backgroundColor = "#eee"

      $inner.style.width = props.width + "px"
      $inner.style.display = "flex"
      $inner.style.overflow = "auto"

      for (let img of props.images) {
        const $img = document.createElement("img")
        $img.style.width = props.width + "px"
        $img.style.height = props.height + "px"
        $img.style.flexShrink = 0
        $img.src = img
        $inner.append($img)
      }

      $div.appendChild($inner)

      const $prev = document.createElement("div")
      $prev.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff"><path d="M15 8.25H5.87l4.19-4.19L9 3 3 9l6 6 1.06-1.06-4.19-4.19H15v-1.5z"/></svg>'
      $prev.style.width = "34px"
      $prev.style.height = "34px"
      $prev.style.backgroundColor = "rgba(0,0,0,0.5)"
      $prev.style.position = "absolute"
      $prev.style.display = "flex"
      $prev.style.alignItems = "center"
      $prev.style.justifyContent = "center"
      $prev.style.top = "50%"
      $prev.style.left = "10px"
      $prev.style.transform = "translateY(-50%)"

      $prev.addEventListener("click", () => {
        $inner.scrollTo({
          left: $inner.scrollLeft - props.width,
          behavior: "smooth"
        })
      })

      $div.appendChild($prev)

      const $next = document.createElement("div")
      $next.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fff"><path d="M9 3L7.94 4.06l4.19 4.19H3v1.5h9.13l-4.19 4.19L9 15l6-6z"/></svg>'
      $next.style.width = "34px"
      $next.style.height = "34px"
      $next.style.backgroundColor = "rgba(0,0,0,0.5)"
      $next.style.position = "absolute"
      $next.style.display = "flex"
      $next.style.alignItems = "center"
      $next.style.justifyContent = "center"
      $next.style.top = "50%"
      $next.style.right = "10px"
      $next.style.transform = "translateY(-50%)"

      $next.addEventListener("click", () => {
        $inner.scrollTo({
          left: $inner.scrollLeft + props.width,
          behavior: "smooth"
        })
      })

      $div.appendChild($next)

      return $div
    default:
      const el = document.createElement(tag)
      for (let key in props) {
        el.setAttribute(key, props[key])
      }
      for (let child of children) {
        if (typeof child === "string") {
          el.append(document.createTextNode(child))
        } else {
          el.append(render(child))
        }
      }
      return el
  }
}

const init = async () => {
  log("inited")
  const [sendMessageToSandbox, onMessage] = await initSandbox()

  const $canvas = document.querySelector("#canvas")
  sendMessageToSandbox("render", {}, data => {
    $canvas.innerHTML = ""
    console.log(render(data.html))
    $canvas.append(render(data.html))
  })
}

init()
