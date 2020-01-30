# SWA (prototype)

[AMP](https://amp.dev/) offers built-in component(carousel, story .etc) with stricter syntax, together with CDN cache, it helps build fast web pages, because now developers couldn't mess around the code easily.

other than stricter HTML syntax and valiator,
what about another approach - forbidding direct DOM manipulation?

lik we could separate the `logic` and `view`,

1. developers write the logic
2. but the view is controlled by the host

following demo is just a PoC demo

# Demo

here is a [demo](https://sunderls.github.io/swa/demo/host.html)

![Jan-31-2020 01-58-13](https://user-images.githubusercontent.com/2394070/73471737-3123ae00-43cd-11ea-9d80-673c504a229f.gif)

# Implementation

1. `host.html` run the app (`app.js`) in an iframe, with `swa.js` as the runtime

2. `host` ask `app` to generate the html

```js
sendMessageToSandbox("render", {}, data => {
  $canvas.append(render(data.html))
})
```

3. `app` return html representation to `host`, with 2 `<p>` and a `<carousel>`

```js
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
  }
})
```

4. `host` receive the JSON, and render it into DOM

```js
const render = ({ tag, children = [], props = {} }) => {
  switch (tag) {
    case "carousel":
      ...
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
```
