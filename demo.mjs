import {EditorView, EditorState, basicSetup} from '@codemirror/next/basic-setup';
import {foldAll} from '@codemirror/next/fold';
import {acceptView, revertView, acceptString, revertString} from './index.mjs';
import {html, render} from 'lit-html';

function makeEditors(live) {
  let center = new EditorView({
    state: EditorState.create({
      doc:
`CodeMirror 6's merge addon displays diffs.
Features and limitations:
+ mobile-first
+ unified diff`,
      extensions: [
        basicSetup,
      ],
    }),
  });

  let left = new EditorView({
    state: EditorState.create({
      doc:
`CodeMirror 5's merge addon displays diffs.
Features and limitations:
+ 2-way and 3-way diffs
- only left or center pane is editable
+ unlocked scrolling
+ 2-way only: optionally align changed sections
+ 2-way only: optionally collapse unchanged lines`,
      extensions: [
        basicSetup,
        live ?
          acceptView(center, {foldMargin: 1}) :
          acceptString(center.state.doc.toString(), {foldMargin: 1}),
      ],
    }),
  });
  foldAll(left);

  let right = new EditorView({
    state: EditorState.create({
      doc:
`CodeMirror 6's merge addon displays diffs.
Features and limitations:
+ mobile-first
+ unified diff
+ collapse unchanged lines`,
      extensions: [
        basicSetup,
        live ?
          revertView(center, {foldMargin: 1}) :
          revertString(center.state.doc.toString(), {foldMargin: 1}),
      ],
    }),
  });
  foldAll(right);
  return {left, center, right};
}


let live = makeEditors(/*live=*/true);
let static_ = makeEditors(/*live=*/false);
render(html`
  <style>
    .container {
      display: flex;
    }
    .container > div > .cm-wrap {
      height: 100%;
    }
    .side {
      flex-basis: 0;
      flex-grow: 1;
      min-width: 0;
    }
    .merge {
      background-color: #eee;
    }
  </style>
  Live source:
  <div class="container">
    <div class="side">${live.left.dom}</div>
    <div class="side">${live.center.dom}</div>
    <div class="side">${live.right.dom}</div>
  </div>
  Static source:
  <div class="container">
    <div class="side">${static_.left.dom}</div>
    <div class="side">${static_.center.dom}</div>
    <div class="side">${static_.right.dom}</div>
  </div>
`, document.body);
