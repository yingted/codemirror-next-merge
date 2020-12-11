import {EditorView, EditorState, basicSetup} from '@codemirror/next/basic-setup';
import {foldAll} from '@codemirror/next/fold';
import {watchAndDiffBackward, watchAndDiffForward} from './index.mjs';

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
    ],
  }),
  parent: document.querySelector('#a'),
});

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
    ],
  }),
  parent: document.querySelector('#c'),
});

watchAndDiffForward(left, center);
watchAndDiffBackward(center, right);
