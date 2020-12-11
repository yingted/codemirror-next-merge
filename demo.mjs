import {EditorView, EditorState, basicSetup} from '@codemirror/next/basic-setup';
import {foldAll} from '@codemirror/next/fold';
import {acceptView, revertView} from './index.mjs';

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
  parent: document.querySelector('#b'),
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
      acceptView(center, {foldMargin: 1}),
    ],
  }),
  parent: document.querySelector('#a'),
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
      revertView(center, {foldMargin: 1}),
    ],
  }),
  parent: document.querySelector('#c'),
});
foldAll(right);
