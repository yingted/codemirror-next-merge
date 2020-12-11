# codemirror-next-merge
Demo:
[live](https://yingted.github.io/codemirror-next-merge/demo.html)
[local](/demo.html)

## Usage
```bash
npm install --save yingted/codemirror-next-merge
```

```js
import {EditorView, EditorState, basicSetup} from '@codemirror/next/basic-setup';
import {acceptString} from 'codemirror-next-merge';
let view = new EditorView({
  state: EditorState.create({
    doc: 'old doc',
    extensions: [
      basicSetup,
      acceptString('new doc'),
    ],
  }),
  parent: document.querySelector('#editor'),
});
```

## Build
```
npm install
npm run build-demo
npm run serve-demo
```

Then, open: http://127.0.0.1:8081/demo.html
